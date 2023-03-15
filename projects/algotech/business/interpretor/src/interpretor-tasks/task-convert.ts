import { Observable, zip, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, TaskConvertDto, InterpretorTransferTransitionDto, WorkflowTaskActionUploadDto } from '../dto';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { TaskConvertError } from '../error/tasks-error';
import { SmartObjectDto, WorkflowVariableModelDto, PairDto, SysFile, FileUploadDto } from '@algotech/core';
import { UUID } from 'angular2-uuid';
import moment from 'moment';

export class TaskConvert extends TaskBase {

    _task: InterpretorTaskDto;
    fileId: string;
    templateName: string;
    inputs: PairDto[];
    keysTypes: WorkflowVariableModelDto[];
    fileName: string;
    download: boolean;
    save: boolean;
    object: SmartObjectDto;
    file: SysFile;
    version: SysFile;
    ext = 'pdf';

    dataValidate: InterpretorValidateDto;


    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        this._task = task;
        const customData = (task.custom as TaskConvertDto);
        return zip(
            customData.inputFile ? customData.inputFile() : of(null),
            customData.fileName ? customData.fileName() : of(''),
            customData.download ? customData.download() : of(false),
            customData.save ? customData.save() : of(false),
            customData.object ? customData.object() : of(null),
            customData.version ? customData.version() : of(null),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-050', err, TaskConvertError);
            }),
            mergeMap((values) => {
                this.file = values[0];
                this.fileName = (values[1] !== '') ? values[1] : (this.file.name ? this.file.name : 'document');
                this.fileName = `${this.fileName.split('.')[0]}.${this.ext}`,

                    this.download = values[2];
                this.save = values[3];
                this.object = values[4];
                this.version = values[5];

                return this.reportsUtils.convertFile(this.file.versionID, this.fileName, this.download, task.instance.context);
            }),
            map((file: Blob) => {
                if (!file) {
                    throw new TaskConvertError('ERR-051', `{{FILE-IS-EMPTY}}`);
                }
                const versionID = UUID.UUID();
                const documentID = this.version ? this.version.documentID : UUID.UUID();

                const info: FileUploadDto = {
                    documentID,
                    versionID,
                    reason: '',
                    tags: _.join([], ','),
                    userID: this._task.instance.context.user.uuid,
                    metadatas: JSON.stringify([]),
                };
                return this._computevalidation([
                    this._createActionTransfer(documentID, file, info, versionID, []),
                    this._createDataTransfer([{
                        file: file,
                        documentID,
                        versionID
                    }])
                ]);
            }),
        );

    }

    _createActionTransfer(documentID: string, uploadFile: Blob, info: FileUploadDto, versionID: string, tags: string[]) {
        const action: WorkflowTaskActionUploadDto = {
            smartObject: (this.object && this.save) ? this.object.uuid : null,
            fileName: this.fileName,
            fileType: uploadFile.type,
            file: versionID,
            info,
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'upload',
                asset: {
                    file: uploadFile,
                    private: this._task.instance.uuid,
                    saved: false,
                    infoFile: {
                        documentID: documentID,
                        dateUpdated: moment().format(),
                        name: this.fileName,
                        ext: this.ext,
                        user: info.userID,
                        reason: info.reason,
                        size: uploadFile.size,
                        tags: tags,
                        metadatas: [],
                        versionID: versionID
                    }
                },
                value: action
            }
        };
        return transfer;
    }

    _createDataTransfer(files: { file: Blob, documentID: string, versionID: string }[]) {

        const data = this._getTransitionData(this._task);
        if (!data) {
            return null;
        }

        const dateUpdated = moment().format();

        const re = /(?:\.([^.]+))?$/;

        const fileInfo: SysFile[] = _.map(files, (file: { file: Blob, documentID: string, versionID: string }) => {
            const d: SysFile = {
                dateUpdated,
                ext: this.ext,
                name: this.fileName,
                documentID: file.documentID,
                versionID: file.versionID,
                reason: '',
                size: file.file.size,
                user: `${this._task.instance.context.user.firstName} ${this._task.instance.context.user.lastName}`,
                tags: [],
                metadatas: [],
            };

            return d;
        });

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data,
            type: 'sysobjects',
            value: fileInfo[0],
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
