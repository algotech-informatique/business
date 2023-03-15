import { from, throwError, Observable, zip, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto } from '../dto';
import { TaskDataBufferError } from '../error/tasks-error';
import { TaskDataBufferDto } from '../dto/tasks/task-data-buffer.dto';
import { InterpretorSoUtils } from '../interpretor-reader/interpretor-so/interpretor-so-utils';

export class TaskDataBuffer extends TaskBase {

    _task: InterpretorTaskDto;
    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        this._task = task;
        const customData = (task.custom as TaskDataBufferDto);
        return zip(
            customData.data ? customData.data({ ignoreClone: true, formatted: true }) : of([]),
            customData.cumul(),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-011', err, TaskDataBufferError);
            }),
            map((values: any[]) => {
                const data = values[0];
                const cumul = values[1];

                const trData = this._getTransitionData(task);
                const isSmartObject = trData.type.startsWith('so:') || trData.type.startsWith('sk:');

                let finalData = Array.isArray(data) ? data : [data];

                if (cumul) {
                    // find old value
                    finalData = [...this.getOldData(trData, isSmartObject), ...finalData];
                }

                if (finalData.length === 1 && !trData.multiple) {
                    finalData = finalData[0];
                }

                return {
                    transfers: [{
                        saveOnApi: false,
                        data: this._getTransitionData(task),
                        type: isSmartObject ? 'smartobjects' : 'sysobjects',
                        value: finalData,
                    }],
                    transitionKey: 'done'
                };
            })
        );
    }

    private getOldData(trData: { key: string, type: string }, isSmartObject: boolean) {
        // find old value
        const oldData = this._task.instance.data.find((d) => d.key === trData.key);
        if (oldData && oldData.value) {
            const value = Array.isArray(oldData.value) ? oldData.value : [oldData.value];

            if (!isSmartObject) {
                return value;
            }

            return _.compact(value.map((uuid: string) => {
                return InterpretorSoUtils.quickFind(this._task.instance.smartobjects, this._task.instance.context.custom.indexes, uuid);
            }));
        }

        return [];
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string, multiple: boolean } {
        const transition = task.transitions.find((t) => t.key === 'done');
        if (!transition || transition.data.length === 0 ||
            !transition.data[0].key ||
            !transition.data[0].type) {
            throw new TaskDataBufferError('ERR-012', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: transition.data[0].key,
            type: transition.data[0].type,
            multiple: transition.data[0].multiple,
        };
    }
}
