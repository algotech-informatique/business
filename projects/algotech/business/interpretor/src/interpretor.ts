import {
    WorkflowInstanceDto, WorkflowModelDto, PairDto, WorkflowDataDto, WorkflowSettingsDto, WorkflowInstanceContextDto, SmartObjectDto
} from '@algotech/core';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorJumpDto, InterpretorFinisherDto, InterpretorMetricsKeys, DownloadDataDto } from './dto';
import { Observable, throwError, of, zip, defer } from 'rxjs';
import { delayWhen, catchError, tap, map, mergeMap, first } from 'rxjs/operators';
import { UUID } from 'angular2-uuid';
import { WorkflowErrorOldInstance, WorkflowErrorScheduled } from './error/interpretor-error';
import * as _ from 'lodash';
import moment from 'moment';
import { InterpretorReader } from './interpretor-reader/interpretor-reader';
import { InterpretorUtils } from './interpretor-utils/interpretor-utils';
import { InterpretorData } from './interpretor-data/interpretor-data';
import { InterpretorSave } from './interpretor-save/interpretor-save';
import { InterpretorSo } from './interpretor-reader/interpretor-so/interpretor-so';
import { InterpretorMetrics } from './interpretor-metrics/interpretor-metrics';


export class Interpretor {

    constructor(
        protected workflowSo: InterpretorSo,
        protected workflowReader: InterpretorReader,
        protected workflowUtils: InterpretorUtils,
        protected workflowData: InterpretorData,
        protected workflowSave: InterpretorSave,
        protected workflowMetrics: InterpretorMetrics) {
    }

    public startWorkflow(modelKey: string, settings: WorkflowSettingsDto,
        context: WorkflowInstanceContextDto, inputs: PairDto[] = []): Observable<InterpretorTaskDto> {

        return defer(() => {
            this.workflowMetrics.start(context.metrics, InterpretorMetricsKeys.InterpretorOther);
            const formatedInputs = this._formatData(inputs);
            return this.workflowData.getModel(modelKey, context).pipe(
                mergeMap((workflow: WorkflowModelDto) => this._newInstance(workflow, settings, formatedInputs, context)),
                mergeMap((instance) => this._loadInstance(instance)),
                tap((instance) => {
                    this.workflowMetrics.stop(context.metrics, InterpretorMetricsKeys.InterpretorOther);
                    this.workflowMetrics.stopRunning(context.metrics, 'tasks');

                    console.log(this.workflowMetrics.getMetrics(context.metrics, 'process'));
                })
            );
        })

    }

    public runInstance(instanceUUID: string, context: WorkflowInstanceContextDto): Observable<InterpretorTaskDto> {
        return this.workflowData.getInstance(instanceUUID, context).pipe(
            mergeMap((instance: WorkflowInstanceDto) => this._loadInstance(instance)),
        );
    }

    public taskValidate(instance: WorkflowInstanceDto, validate: InterpretorValidateDto): Observable<InterpretorTaskDto | InterpretorFinisherDto> {
        return this._decoreResponse(this._validate(instance, validate), instance);
    }

    public taskJump(instance: WorkflowInstanceDto, jump: InterpretorJumpDto): Observable<InterpretorTaskDto> {
        return this._decoreResponse(this._jump(instance, jump), instance);
    }

    /** public for test */
    _decoreResponse(action$: Observable<any>, instance: WorkflowInstanceDto): Observable<InterpretorTaskDto> {
        return action$.pipe(
            catchError((e) => {
                return this.workflowSave.save(instance).pipe(
                    mergeMap(() => throwError(e))
                );
            }),
            delayWhen(() => this.workflowSave.save(instance))
        );
    }

    /** public for test */
    _initializeData(inputs: PairDto[], model: WorkflowModelDto, context: WorkflowInstanceContextDto):
        Observable<{ smartobjects: SmartObjectDto[], data: WorkflowDataDto[] }> {

        // process
        const collect$ = _.compact([
            ...inputs.map((input) => {
                const variable = model.variables.find((v) => v.key === input.key);
                if (!variable) {
                    return null;
                }

                const dataSmartObjects$ = this.workflowSo.initializeData(input, variable, context);
                if (dataSmartObjects$) {
                    return dataSmartObjects$;
                }

                return of({
                    smartobjects: [],
                    data: {
                        key: input.key,
                        value: input.value,
                        type: variable.type,
                    }
                });
            }),
            // undefined input
            ...model.variables.map((variable) => {
                const input = inputs.find((input) => variable.key === input.key);
                if (input) {
                    return null;
                }
                return of({
                    smartobjects: [],
                    data: {
                        key: variable.key,
                        type: variable.type,
                        value: null,
                    }
                });
            })
        ]);

        // format
        return (collect$.length === 0 ? of([]) : zip(...collect$)).pipe(
            map((res) => ({
                smartobjects: _.uniqBy(_.flatMapDeep(res, 'smartobjects'), 'uuid'),
                data: _.flatMap(res, 'data'),
            }))
        )
    }

    /** public for test */
    _newInstance(model: WorkflowModelDto, settings: WorkflowSettingsDto, inputs: PairDto[],
        context: WorkflowInstanceContextDto): Observable<WorkflowInstanceDto> {

        return this._initializeData(inputs, model, context).pipe(
            map((data) => {
                const res: WorkflowInstanceDto = {
                    uuid: UUID.UUID(),
                    createdDate: moment().format(),
                    finishDate: null,
                    startDate: null,
                    updateDate: new Date().toDateString(),
                    data: data.data,
                    participants: [],
                    settings,
                    smartobjects: data.smartobjects,
                    documents: [],
                    stackTasks: [],
                    stackData: [],
                    state: 'todo',
                    workflowModel: model,
                    context
                };
                return res;
            }),
            mergeMap((instance) => {
                return this.workflowSo.downloadDocuments(instance.data, instance.documents, instance.context).pipe(
                    map(() => instance),
                )
            }),
            mergeMap((instance) => {
                return this.workflowSo.downloadData(instance.data, instance.smartobjects, instance.documents,
                    instance.context.smartmodels, instance.context)
                    .pipe(
                        map((download: DownloadDataDto) => {
                            instance.data = download.datas;
                            return instance;
                        }),
                    );
            })
        )
    }

    /** public for test */
    _execute(instance: WorkflowInstanceDto): Observable<InterpretorTaskDto | any> {
        return this.workflowReader.execute(instance).pipe(
            mergeMap((taskDto: InterpretorTaskDto) => {
                const newTask = this.workflowUtils.createBackgroundTaskInstance(taskDto.type);

                this.workflowMetrics.stopRunning(instance.context.metrics, 'tasks');
                if (newTask) {

                    this.workflowMetrics.start(instance.context.metrics, taskDto.type, 'tasks');
                    this.workflowMetrics.start(instance.context.metrics, taskDto.type, 'process');
                    // prevent RangeError
                    return newTask.execute(taskDto)
                        .pipe(
                            tap(() => this.workflowMetrics.stop(instance.context.metrics, taskDto.type, 'process')),
                            first(), // force to complete
                            mergeMap((result: InterpretorValidateDto | InterpretorJumpDto | InterpretorFinisherDto) => {
                                if (result instanceof InterpretorFinisherDto) {
                                    return this._finish(instance, result);
                                } else if (result instanceof InterpretorJumpDto) {
                                    return this._jump(instance, result);
                                } else {
                                    return this._validate(instance, result);
                                }
                            }),
                            mergeMap((res) => new Promise((resolve) => resolve(res))) // prevent maximum call stack excedeed
                        )
                }
                return of(taskDto);
            }),
        );
    }

    /** public for test */
    _jump(instance: WorkflowInstanceDto, jump: InterpretorJumpDto): Observable<InterpretorTaskDto> {
        try {
            this.workflowReader.jump(instance, jump);
        } catch (e) {
            return throwError(e);
        }

        return this._execute(instance);
    }

    /** public for test */
    _validate(instance: WorkflowInstanceDto, validate: InterpretorValidateDto): Observable<InterpretorTaskDto | InterpretorFinisherDto> {
        try {
            return this.workflowReader.validate(instance, validate).pipe(
                mergeMap(() => {
                    if (this.workflowUtils.isFinished(instance)) {
                        return of(new InterpretorFinisherDto(instance));
                    }

                    return this._execute(instance);
                })
            )
        } catch (e) {
            return throwError(e);
        }
    }

    /** public for test */
    _finish(instance: WorkflowInstanceDto, finish: InterpretorFinisherDto): Observable<InterpretorFinisherDto> {
        try {
            this.workflowReader.finish(instance, finish.save);
        } catch (e) {
            return throwError(e);
        }
        return of(finish);
    }

    /** public for test */
    _loadInstance(instance: WorkflowInstanceDto): Observable<InterpretorTaskDto> {

        if (!this._checkScheduled(instance.rangeDate)) {
            return throwError(new WorkflowErrorScheduled('ERR-137', '{{DATE-DOESNT-MATCH}}'));
        }

        if (this.workflowUtils.isFinished(instance)) {
            return throwError(new WorkflowErrorOldInstance(instance, 'ERR-098', '{{INSTANCE-ALREADY-PLAYED}}'));
        }
        try {
            if (instance.state === 'todo') {
                this.workflowReader.moveForward(instance);
            }
        } catch (e) {
            return throwError(e);
        }

        return this._decoreResponse(this._execute(instance), instance);
    }

    /** public for test */
    _checkScheduled(rangeDate: string[]): boolean {
        if (!rangeDate || rangeDate.length === 0) {
            return true;
        }

        if (rangeDate.length > 2) {
            throw new WorkflowErrorScheduled('ERR-138', '{{RANGE-DATA-FORMAT}} {{INCORRECT}}');
        }

        if (rangeDate.length === 1) {
            return new Date(rangeDate[0]) < new Date();
        } else {
            return new Date(rangeDate[0]) < new Date() && new Date(rangeDate[1]) >= new Date();
        }
    }

    /** public for test */
    _isJsonStringify(data: any) {
        let item = null;
        try {
            item = JSON.parse(data);
        } catch (e) {
            return false;
        }
        if (typeof item === "object" && item !== null) {
            return true;
        }
        return false;
    }

    /** public for test */
    _formatData(inputs) {
        return _.map(inputs, (input: PairDto) => {
            if (this._isJsonStringify(input.value)) {
                return { key: input.key, value: JSON.parse(input.value) };
            } else {
                return input;
            }
        });
    }
}
