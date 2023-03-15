import { Observable, zip } from 'rxjs';
import { SmartObjectDto, SysFile } from '@algotech/core';
import * as _ from 'lodash';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import {
    InterpretorValidateDto, InterpretorTaskDto, WorkflowTaskActionDeleteDocumentsDto,
    InterpretorTransferTransitionDto, TaskDeleteDocumentDto
} from '../dto';
import { TaskDeleteDocumentError } from '../error/tasks-error';
export class TaskDeleteDocument extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskDeleteDocumentDto);
        return zip(
            customData.objectLinked(),
            customData.documents(),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-004', err, TaskDeleteDocumentError);
            }),
            map((values: any[]) => {
                const so: SmartObjectDto = values[0];
                const documents: SysFile[] = _.isArray(values[1]) ? values[1] : [values[1]];

                const action: WorkflowTaskActionDeleteDocumentsDto = {
                    smartObject: so.uuid,
                    documentsID: _.map(documents, ((doc: SysFile) => doc.documentID))
                };

                const transfers: InterpretorTransferTransitionDto[] = [{
                    saveOnApi: true,
                    type: 'action',
                    value: {
                        actionKey: 'delete-documents',
                        value: action,
                    }
                }];

                return {
                    transitionKey: 'done',
                    transfers: transfers,
                };
            })
        );
    }
}
