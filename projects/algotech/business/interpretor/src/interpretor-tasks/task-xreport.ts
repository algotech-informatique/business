import { zip, Observable, of } from 'rxjs';
import { map, flatMap, catchError, mergeMap } from 'rxjs/operators';
import { SmartObjectDto, SysFile, PairDto, FileUploadDto, WorkflowVariableModelDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import moment from 'moment';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, InterpretorTransferTransitionDto, WorkflowTaskActionUploadDto } from '../dto';
import { TaskReportCreateError } from '../error/tasks-error';
import { UUID } from 'angular2-uuid';
import { TaskXReportDto } from '../dto/tasks/task-x-report.dto';


export class TaskXReport extends TaskBase {

    _task: InterpretorTaskDto;
    fileId: string;
    templateName: string;
    ext: string;
    inputs: PairDto[];
    keysTypes: WorkflowVariableModelDto[];
    fileName: string;
    download: boolean;
    generate: boolean;
    object: SmartObjectDto;
    version: SysFile;

    dataValidate: InterpretorValidateDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        this._task = task;
        const customData = (task.custom as TaskXReportDto);
        return zip(
            customData.fileId ? customData.fileId() : of(''),
            customData.templateName ? customData.templateName() : of(''),
            customData.inputs ? customData.inputs({ formatted: true}) : of([]),
            customData.keysTypes ? customData.keysTypes() : of([]),
            customData.fileName ? customData.fileName() : of(''),
            customData.download ? customData.download() : of(false),
            customData.generate ? customData.generate() : of(false),
            customData.object ? customData.object() : of(null),
            customData.version ? customData.version() : of(null),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-026', err, TaskReportCreateError);
            }),
            mergeMap(([fileId, templateName, inputs, keysTypes, fileName, download, generate, object, version]) => {
                this.fileId = fileId;
                this.templateName = templateName;
                this.ext = this.templateName.split('.').pop();
                this.keysTypes = keysTypes;
                this.fileName = (fileName !== '') ? fileName.split('.')[0] : this.templateName.split('.')[0];
                this.fileName = `${this.fileName}.${this.ext}`,
                    this.download = download;
                this.generate = generate;
                this.object = object;
                this.version = version;
                return this.reportsUtils.getSysFileInputs(task.instance.uuid, inputs, keysTypes, task.instance.context);
            }),
            mergeMap(inputs => {
                this.inputs = _.reduce(inputs, (results, input) => {
                    const k = _.find(this.keysTypes, (key) => key.key === input.key);
                    input.value = this.soUtils.nestedSmartObjectsGetValue(task.instance.smartobjects, { keyType: (k) ? k.type : 'string' }, task.instance.context.glists, task.instance.context.user.preferedLang, input.value);
                    if (input.value && input.value != '') {
                        results.push(input);
                    }
                    return results;
                }, []);

                return this.reportsUtils.generateXReport(this.fileId, this.inputs, this.fileName, this.ext,
                    this.download, task.instance.smartobjects, task.instance.context);
            }),
            map((file: Blob) => {
                return this._computevalidation(this.getTransfers(file));
            }));
    }

    getTransfers(file: Blob): InterpretorTransferTransitionDto[] {

        const transfers: InterpretorTransferTransitionDto[] = [];

        const versionID = UUID.UUID();
        const documentID = this.version ? this.version.documentID : UUID.UUID();
        const info: FileUploadDto = {
            documentID,
            versionID,
            reason: '',
            tags: '',
            userID: this._task.instance.context.user.uuid,
            metadatas: '',
        };

        transfers.push(this._createActionTransfer(documentID, file, info, versionID));
        transfers.push(this._createDataTransfer(file, documentID, versionID));

        return _.compact(transfers);
    }

    _createActionTransfer(documentID: string, file: Blob, info: FileUploadDto, versionID: string) {

        const action: WorkflowTaskActionUploadDto = {
            smartObject: (this.object && this.generate) ? this.object.uuid : null,
            fileName: this.fileName,
            fileType: file.type,
            file: versionID,
            info,
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'upload',
                asset: {
                    file: file,
                    private: this._task.instance.uuid,
                    saved: false,
                    infoFile: {
                        documentID: documentID,
                        dateUpdated: moment().format(),
                        name: action.fileName,
                        ext: this.ext,
                        user: info.userID,
                        reason: info.reason,
                        size: file.size,
                        tags: [],
                        versionID: versionID
                    }
                },
                value: action
            }
        };
        return transfer;
    }

    _createDataTransfer(file: Blob, documentID: string, versionID: string) {

        const data = this._getTransitionData(this._task);
        if (!data) {
            return null;
        }

        const dateUpdated = moment().format();

        const fileInfo: SysFile = {
            dateUpdated,
            ext: this.ext,
            name: this.fileName,
            documentID: documentID,
            versionID: versionID,
            reason: '',
            size: file.size,
            user: `${this._task.instance.context.user.firstName} ${this._task.instance.context.user.lastName}`,
            tags: [],
            metadatas: [],
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data,
            type: 'sysobjects',
            value: fileInfo,
        };

        return transfer;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    _computevalidation(transferData): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transferData
        };
        return validation;
    }
}
