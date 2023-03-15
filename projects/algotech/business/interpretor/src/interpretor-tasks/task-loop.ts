import { Observable, zip, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorTransferTransitionDto, InterpretorValidateDto } from '../dto';
import { TaskLoopDto } from '../dto/tasks/task-loop.dto';
import { TaskLoopError } from '../error/tasks-error';
import { SmartObjectDto } from '@algotech/core';

const KEYWORD_INDEX = '$__i_';
const KEYWORD_ITEMS = '$__items_';
export class TaskLoop extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskLoopDto);

        const data = this._getTransitionData(task);
        const itemsKey = `${KEYWORD_ITEMS}${data.key}`;

        return zip(
            customData.forEach(),
            customData.count ? customData.count() : of(-1),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-009', err, TaskLoopError);
            }),
            mergeMap((values: any[]) => {
                const isForEach: boolean = values[0];
                const count: number = values[1];

                const indexKey = (isForEach) ? `${KEYWORD_INDEX}${data.key}` : data.key;

                // find index
                const findData = task.instance.data.find((d) => d.key === indexKey);
                const index: number = findData && findData.value !== -1 ? findData.value + 1 : 0;

                const loopItems = task.instance.context.custom.loop?.[itemsKey];
                const items$ = loopItems && index > 0 ? of(loopItems) : (customData.items ? customData.items({ ignoreClone: true }) : of([]));

                return items$.pipe(
                    map((items) => {
                        const elementsLength = (isForEach) ? items.length : count;
                        if (index + 1 > elementsLength) {
                            const res: InterpretorValidateDto = {
                                transfers: this._getInterpretorTransfer(isForEach, indexKey, itemsKey, -1, items, task, 'done'),
                                transitionKey: 'done'
                            };
                            return res;
                        } else {
                            const res: InterpretorValidateDto = {
                                transfers: this._getInterpretorTransfer(isForEach, indexKey, itemsKey, index, items, task, 'next'),
                                transitionKey: 'next'
                            };
                            return res;
                        }
                    })
                )
            })
        );
    }

    private _getInterpretorTransfer(isForEach: boolean, indexKey: string, itemsKey: string, index: number, items: any,
        task: InterpretorTaskDto, transitionKey: 'done' | 'next'): InterpretorTransferTransitionDto[] {

        const transfers: InterpretorTransferTransitionDto[] = [];
        const numberTransfer: InterpretorTransferTransitionDto = {
            saveOnApi: false,
            data: {
                key: indexKey,
                type: 'number',
            },
            type: 'sysobjects',
            value: index,
        };
        transfers.push(numberTransfer);

        if (isForEach && transitionKey === 'next') {
            if (index === 0) {
                if (!task.instance.context.custom.loop) {
                    task.instance.context.custom.loop = {};
                }
                task.instance.context.custom.loop[itemsKey] = items;
            }

            const itemTransfer: InterpretorTransferTransitionDto = {
                saveOnApi: false,
                data: this._getTransitionData(task),
                type: items[index] instanceof SmartObjectDto ? 'smartobjects' : 'sysobjects',
                value: items[index],
            };
            transfers.push(itemTransfer);
        }

        return transfers;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        const transition = task.transitions.find((t) => t.key === 'next');
        if (!transition || transition.data.length === 0 ||
            !transition.data[0].key ||
            !transition.data[0].type) {
            throw new TaskLoopError('ERR-010', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: transition.data[0].key,
            type: transition.data[0].type
        };
    }
}
