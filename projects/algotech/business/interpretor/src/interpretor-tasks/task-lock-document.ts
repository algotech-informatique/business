import { Observable, zip } from 'rxjs';
import { SmartObjectDto, FileEditDto, DocumentLockStateDto, SysFile } from '@algotech/core';
import * as _ from 'lodash';
import { map, catchError } from 'rxjs/operators';
import moment from 'moment';
import { TaskBase } from './task-base';

import {
    InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto,
    WorkflowTaskActionEditDocumentDto, TaskLockDocumentDto
} from '../dto';
import { TaskLockDocumentError } from '../error/tasks-error';

export class TaskLockDocument extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskLockDocumentDto);
        return zip(
            customData.objectLinked(),
            customData.documents(),
            customData.locked(),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-008', err, TaskLockDocumentError);
            }),
            map((values: any[]) => {
                const so: SmartObjectDto = values[0];
                const documents: SysFile[] = _.isArray(values[1]) ? values[1] : [values[1]];
                const locked = values[2];

                const transfers: InterpretorTransferTransitionDto[] = _.map(documents, (document: SysFile) => {
                    const lockState: DocumentLockStateDto = locked ? {
                        date: moment().format(),
                        userID: task.instance.context.user.uuid,
                        user: `${task.instance.context.user.firstName} ${task.instance.context.user.lastName}`
                    } : null;

                    const edit: FileEditDto = {
                        uuid: document.documentID,
                        lockState
                    };

                    const action: WorkflowTaskActionEditDocumentDto = {
                        smartObject: so.uuid,
                        edit
                    };
                    return {
                        saveOnApi: true,
                        type: 'action',
                        value: {
                            actionKey: 'lock-document',
                            value: action,
                        }
                    };
                });

                return {
                    transitionKey: 'done',
                    transfers: transfers,
                };
            })
        );
    }
}
