import { TaskBase } from './task-base';
import {
    InterpretorTaskDto, InterpretorValidateDto, TaskConnectorDto,
    InterpretorTransferTransitionDto
} from '../dto';
import { Observable, zip, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { TaskConnectorError } from '../error/tasks-error';
import { PairDto, SmartObjectDto, WorkflowLaunchOptionsDto } from '@algotech/core';
import * as _ from 'lodash';
import { ATHttpException } from '../error/http-exception';

export class TaskConnector extends TaskBase {
    _task: InterpretorTaskDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        this._task = task;
        const customData = (task.custom as TaskConnectorDto);
        return zip(
            customData.smartFlow(),
            customData.inputs ? customData.inputs() : of([]),
            customData.runOutside ? customData.runOutside() : of(false)
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-053', err, TaskConnectorError);
            }),
            mergeMap((values: any[]) => {

                const smartFlow: string = values[0];
                const inputs: PairDto[] = values[1];
                const runOutside: boolean = values[2];

                const data: WorkflowLaunchOptionsDto = {
                    key: smartFlow,
                    inputs: inputs,
                    readonly: this.interpretorUtils.isReadonly(this._task.instance),
                };

                if (runOutside) {
                    return of({
                        transitionKey: 'done',
                        transfers: [this._createActionTransfer(data)],
                    });
                }

                return this.smartFlowUtils.start(data, this._task.instance.context).pipe(
                    map((datas: any) => {
                        if (datas != null && !_.isEqual(datas, {})) {
                            const sos: SmartObjectDto | SmartObjectDto[] = datas;
                            return this._transfers(this._task, sos);
                        } else {
                            return {
                                transitionKey: 'done',
                                transfers: [],
                            };
                        }
                    }),
                    catchError((e: ATHttpException) => {
                        return this.taskUtils.handleHttpError(e, task, TaskConnectorError);
                    }),
                );
            }),
        );
    }

    private _transfers(task: InterpretorTaskDto, value: any) {
        const data = this._getTransitionData(task);
        const transfers: InterpretorTransferTransitionDto[] = [{
            saveOnApi: false,
            data,
            type: data.type.startsWith('so:') || data.type.startsWith('sk:') ? 'smartobjects' : 'sysobjects',
            value
        }];
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transfers
        };
        return validation;
    }

    _createActionTransfer(action: WorkflowLaunchOptionsDto): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'smartflow',
                value: action,
            }
        };
        return transfer;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskConnectorError('ERR-054', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
