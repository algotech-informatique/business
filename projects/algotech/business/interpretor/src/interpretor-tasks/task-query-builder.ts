import { zip, Observable, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, TaskQueryBuilderDto, InterpretorTransferTransitionDto } from '../dto';
import { TaskQueryBuilderError } from '../error/tasks-error';

export class TaskQueryBuilder extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskQueryBuilderError('ERR-021', '{{TASK-PARAMETERS-CORRUPTED}}');
        }

        const customData = (task.custom as TaskQueryBuilderDto);
        return zip(
            customData.connection(),
            customData.wizardMode ? customData.wizardMode() : of(false),
            customData.plainQuery ? customData.plainQuery() : of('')
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-022', err, TaskQueryBuilderError);
            }),
            mergeMap((values: any[]) => {
                const connection = values[0];
                const wizardMode = values[1];
                const request = values[2];
                if (wizardMode) {
                    throw new TaskQueryBuilderError('ERR-023',`{{NOT-YET-IMPEMENTED}}`);
                }
                return this.smartFlowUtils.dbRequest(connection, request);
            }),
            map((result: any) => {
                return this._transfers(task, result);
            }),
        );
    }
    private _transfers(task: InterpretorTaskDto, value: any) {
        const data = this._getTransitionData(task);
        const transfers: InterpretorTransferTransitionDto[] = [{
            saveOnApi: false,
            data,
            type: 'sysobjects',
            value
        }];
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transfers
        };
        return validation;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskQueryBuilderError('ERR-024', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
