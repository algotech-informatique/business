import * as _ from 'lodash';
import { TaskBase } from './task-base';
import {
    InterpretorTaskDto, InterpretorValidateDto, TaskServiceDto, InterpretorTransferTransitionDto,
    InterpretorFormData, InterpretorFormDataValue, WorkflowTaskActionUploadDto,
} from '../dto';
import { TaskServiceError } from '../error/tasks-error';
import { FileUploadDto, PairDto, SmartObjectDto, SysFile } from '@algotech-ce/core';
import { Observable, zip, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { ATHttpException } from '../error/http-exception';

interface FormDataValue {
    key: string;
    isSysFile: boolean;
    data: DataValue[];
}

interface DataValue {
    data: any;
    fileName: string;
}

export class TaskService extends TaskBase {
    _task: InterpretorTaskDto;

    urlFormated: string;
    headers: PairDto[] = [];
    type: 'get' | 'patch' | 'post' | 'put' | 'delete' | 'update' = 'get';

    hasSysFile: boolean;
    listSysFile: string[] = [];

    responseType: 'blob' | 'json' = 'json';
    fileName: string;
    generate: boolean;
    object: SmartObjectDto;
    version: SysFile;
    ext: string;
    mimeType: string;
    multiVariable: boolean;
    jsonObject: object;
    returnHeaders: boolean;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskServiceDto);

        this._task = task;
        return zip(
            customData.url(),
            customData.parameters ? customData.parameters({ formatted: true }) : of([]),
            customData.headers ? customData.headers({ formatted: true }) : of([]),
            customData.body ? customData.body({ formatted: true }) : of([]),
            customData.type(),
            customData.listSysFile ? customData.listSysFile() : of([]),
            customData.responseType ? customData.responseType() : of('json'),
            customData.fileName ? customData.fileName() : of(''),
            customData.generate ? customData.generate() : of(false),
            customData.object ? customData.object() : of(null),
            customData.version ? customData.version() : of(false),
            customData.multiVariable ? customData.multiVariable() : of(true),
            customData.jsonObject ? customData.jsonObject({ formatted: true }) : of([]),
            customData.returnHeaders ? customData.returnHeaders() : of(false),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-035', err, TaskServiceError);
            }),
            mergeMap((values: any[]) => {

                const url: string = values[0];
                const parameters: PairDto[] = values[1];
                const body: PairDto[] = values[3];
                this.type = values[4];
                this.listSysFile = values[5];
                this.hasSysFile = (this.listSysFile.length !== 0);
                this.urlFormated = (parameters.length !== 0) ? `${url}${this.interpretorService.buildQueryRoute(parameters)}` : url;

                this.responseType = values[6] === 'blob' ? 'blob' : 'json';
                this.fileName = values[7];
                this.generate = values[8];
                this.object = values[9];
                this.version = values[10];

                this.multiVariable = values[11];
                this.jsonObject = values[12];
                this.returnHeaders = values[13];

                this._createHeader(values[2]);
                return (this.hasSysFile) ? this._validateFile(body) :
                    this.multiVariable ? this._createObject(body) :
                        this._createJsonObject(this.jsonObject);
            }),
            mergeMap((bodyFormated: any) => {
                return this.interpretorService.call(this.urlFormated, this.headers, bodyFormated, this.type, this.responseType);
            }),
            map((serviceResult: Object | any) => {

                return (this.responseType === 'blob') ?
                    this._validationResponseBlob(serviceResult) :
                    this._validationResponseJson(serviceResult);
            }),
            catchError((e: ATHttpException) => {
                return this.taskUtils.handleHttpError(e, task, TaskServiceError);
            }),
        );
    }

    private _validationResponseJson(serviceResult: Object): InterpretorValidateDto {
        const transfers: InterpretorTransferTransitionDto[] = [{
            saveOnApi: false,
            data: this._getTransitionData(0),
            type: 'sysobjects',
            value: serviceResult['body'] ? serviceResult['body'] : serviceResult
        }];
        if (this.returnHeaders) {
            transfers.push({
                saveOnApi: false,
                data: this._getTransitionData(1),
                type: 'sysobjects',
                value: serviceResult['headers']
            });
        }

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transfers
        };
        return validation;
    }

    private _validationResponseBlob(serviceResult): InterpretorValidateDto {

        const file = serviceResult.data;
        this.ext = (serviceResult.fileName) ? serviceResult.fileName.split('.').pop() : '';
        const fName = (serviceResult.fileName) ? serviceResult.fileName.split('.')[0] : '';

        this.fileName = (this.fileName === '') ? fName : this.fileName.split('.')[0];
        this.fileName = `${this.fileName}.${this.ext}`,

            this.mimeType = serviceResult.mimeType;

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: this.getTransfers(file),
        };
        return validation;
    }

    private _getTransitionData(idx: number): { key: string, type: string } {
        if (this._task.transitions.length === 0 ||
            this._task.transitions[0].data.length <= idx ||
            !this._task.transitions[0].data[idx].key ||
            !this._task.transitions[0].data[idx].type) {
            throw new TaskServiceError('ERR-036', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: this._task.transitions[0].data[idx].key,
            type: this._task.transitions[0].data[idx].type
        };
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
            fileType: this.mimeType,
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

        const data = this._getTransitionData(0);
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

    _createHeader(heads: PairDto[]) {
        this.headers = heads;
        if (this.hasSysFile) {
            this.headers.push({ key: 'enctype', value: 'multipart/form-data' })
            const ind = _.findIndex(this.headers, (head: PairDto) => head.key === 'Content-type')
            if (ind !== -1) {
                this.headers.splice(ind, 1);
            }
        }
    }

    _createObject(body: PairDto[]): Observable<InterpretorFormData> {
        const data: InterpretorFormData = {
            type: 'JSON',
            data: _.fromPairs(_.map(body, (element: PairDto) => [element.key, element.value]))
        }
        return of(data);
    }

    _createJsonObject(jsonObject: object): Observable<InterpretorFormData> {
        const data: InterpretorFormData = {
            type: 'JSON',
            data: jsonObject,
        }
        return of(data);
    }

    _validateFile(body: PairDto[]): Observable<InterpretorFormData> {
        return this._appendFiles(body).pipe(
            map((inputs: FormDataValue[]) => {
                return this._loadFormData(inputs);
            }),
        );
    }

    _loadFormData(inputs: FormDataValue[]): InterpretorFormData {
        const dataValue: InterpretorFormDataValue[] = _.map(inputs, (input: FormDataValue) => {
            return this._loadFormDataValue(input);
        });

        const data: InterpretorFormData = {
            type: 'formData',
            data: _.flatten(dataValue),
        }
        return data;
    }

    _loadFormDataValue(input: FormDataValue): InterpretorFormDataValue[] {
        if (input.isSysFile) {
            const dataValue: InterpretorFormDataValue[] = _.map(input.data, (data: DataValue) => {
                const value: InterpretorFormDataValue = {
                    key: input.key,
                    value: data.data,
                    fileName: data.fileName,
                };
                return value;
            });
            return dataValue;
        }
        const dataValue: InterpretorFormDataValue = {
            key: input.key,
            value: input.data[0].data
        }
        return [dataValue];

    }

    _testIsSysFile(key) {
        return this.listSysFile.some((k: string) => k === key);
    }

    _appendFiles(body: PairDto[]): Observable<FormDataValue[]> {

        const body$: Observable<FormDataValue>[] = _.map(body, (obj: PairDto) => {

            if (this._testIsSysFile(obj.key)) {
                const files: SysFile[] = _.isArray(obj.value) ? obj.value : [obj.value];
                return this._appendFile(obj.key, files);
            } else {
                const fData: FormDataValue = {
                    key: obj.key,
                    isSysFile: false,
                    data: [{
                        data: obj.value,
                        fileName: '',
                    }],
                }
                return of(fData);
            }
        })
        return (body$.length !== 0) ? zip(...body$) : of([]);
    }

    _appendFile(key: string, objects: SysFile[]): Observable<FormDataValue> {
        return this._getFiles(objects).pipe(
            map((files: DataValue[]) => {
                const fData: FormDataValue = {
                    key,
                    isSysFile: true,
                    data: files,
                }
                return fData;
            }),
        );
    }

    _getFiles(objects: SysFile[]): Observable<DataValue[]> {

        const file$: Observable<{ data: Blob, fileName: string }>[] = _.map(objects, (obj: SysFile) => {
            return this._getFile(obj.versionID).pipe(
                map((file: Blob) => {
                    return {
                        data: file,
                        fileName: obj.name,
                    }
                }),
            );
        });
        return (file$.length !== 0) ? zip(...file$) : of([]);
    }

    _getFile(versionID: string): Observable<Blob> {
        return this.reportsUtils.getFile(versionID, this._task.instance.context);
    }
}
