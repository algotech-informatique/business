import { FileUploadDto, SysFile } from '@algotech-ce/core';
import { UUID } from 'angular2-uuid';
import { InterpretorTaskDto, InterpretorTransferTransitionDto, InterpretorValidateDto, WorkflowTaskActionUploadDto } from '../dto';
import * as _ from 'lodash';
import moment from 'moment';
import { TaskUploadOptions } from '../dto/interfaces/task-upload-options';
import { ATHttpException } from '../error/http-exception';
import { NgComponentError } from '../error/tasks-error';
import { of, throwError } from 'rxjs';
import { ClassConstructor } from 'class-transformer';

export class TaskUtils {

    public getUploadTransfers(file: Blob, options: TaskUploadOptions): InterpretorTransferTransitionDto[] {
        const transfers: InterpretorTransferTransitionDto[] = [];

        const info = this._createUploadInfo(options);
        const sysFile = this._createSysFile(file, options, info);

        transfers.push(this._createActionUploadTransfer(file, sysFile, info, options));
        transfers.push(this._createDataUploadTransfer(sysFile, options));
        return _.compact(transfers);
    }

    public handleHttpError(e: ATHttpException, task: InterpretorTaskDto, clsError: ClassConstructor<NgComponentError>) {
        const errData = this._getErrorData(task);
        if (!errData) {
            let err: Error;
            try {
                const apiError = JSON.parse(e.message);
                err = new clsError('ERR-152', `${e.url}\n${apiError.message ?? JSON.stringify(apiError)}`);
            } catch (parseError) {
                err = new clsError('ERR-152', `${e.url}\n${e.message}`);
            }
            return throwError(err);
        }

        return of(this._getHttpErrorTransfers(e, task));
    }

    public computevalidation(transferData, transitionKey = 'done'): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey,
            transfers: transferData
        };
        return validation;
    }

    public getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
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

    /** public for test */
    _getHttpErrorTransfers(error: ATHttpException, task: InterpretorTaskDto) {
        const data = this._getErrorData(task);
        if (!data || data.length !== 2) {
            throw new Error('data corrupted');
        }
        const transfers: InterpretorTransferTransitionDto[] = [{
            saveOnApi: false,
            data: data[0],
            type: 'sysobjects',
            value: error.status
        }, {
            saveOnApi: false,
            data: {
                key: data[1].key,
                type: _.isObject(error.error) ? 'object' : 'string'
            },
            type: 'sysobjects',
            value: error.error
        }];

        return this.computevalidation(transfers, 'error');
    }

    public handleError(code: string, err: Error, clsType: ClassConstructor<NgComponentError>) {
        if (err instanceof NgComponentError) {
            return new clsType(code, '{{FAILED-TO-FETCH-DATA}}' + '\n' + err.message)
        }

        return new clsType(code, '{{FAILED-TO-FETCH-DATA-UNKNOWN-ERROR}}: ' + err.message)
    }

    /** public for test */
    _getErrorData(task: InterpretorTaskDto): { key: string, type: string }[] {
        const errorTr = task.transitions.find((tr) => tr.key === 'error');
        if (!errorTr || !errorTr.task) {
            return null;
        }
        return errorTr.data.map((d) => ({
            key: d.key,
            type: d.type
        }));
    }

    /** public for test */
    _createUploadInfo(options: TaskUploadOptions) {
        const versionID = UUID.UUID();
        const documentID = options.version ? options.version.documentID : UUID.UUID();
        const info: FileUploadDto = {
            documentID,
            versionID,
            reason: '',
            tags: '',
            userID: options.task.instance.context.user.uuid,
            metadatas: '',
        };

        return info;
    }

    /** public for test */
    _createSysFile(file: Blob, options: TaskUploadOptions, info: FileUploadDto) {
        const sysFile: SysFile = {
            documentID: info.documentID,
            versionID: info.versionID,
            dateUpdated: moment().format(),
            name: options.fileName,
            ext: options.ext,
            user: info.userID,
            reason: info.reason,
            size: file.size,
            tags: [],
            metadatas: [],
        };
        return sysFile;
    }

    /** public for test */
    _createActionUploadTransfer(file: Blob, sysFile: SysFile, info: FileUploadDto, options: TaskUploadOptions) {

        const action: WorkflowTaskActionUploadDto = {
            smartObject: (options.object && options.save) ? options.object.uuid : null,
            fileName: options.fileName,
            fileType: file.type,
            file: info.versionID,
            info,
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'upload',
                asset: {
                    file: file,
                    private: options.task.instance.uuid,
                    saved: false,
                    infoFile: sysFile
                },
                value: action
            }
        };
        return transfer;
    }

    /** public for test */
    _createDataUploadTransfer(sysFile: SysFile, options: TaskUploadOptions) {
        const data = this.getTransitionData(options.task);
        if (!data) {
            return null;
        }

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data: data,
            type: 'sysobjects',
            value: sysFile,
        };

        return transfer;
    }
}