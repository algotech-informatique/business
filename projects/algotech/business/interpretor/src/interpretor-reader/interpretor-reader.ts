import {
    WorkflowInstanceDto, WorkflowStackTaskDto, WorkflowOperationDto, WorkflowDataDto
} from '@algotech-ce/core';
import { InterpretorMetricsKeys, InterpretorTaskDto } from '../dto';
import { InterpretorValidateDto } from '../dto';
import { Observable, of, throwError, zip } from 'rxjs';
import { UUID } from 'angular2-uuid';
import {
    WorkflowErrorReader,
    WorkflowErrorJumped
} from '../error/interpretor-error';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { InterpretorTypeJump } from '../dto';
import { InterpretorJumpDto } from '../dto';
import { InterpretorProfiles } from './interpretor-profiles/interpretor-profiles';
import { InterpretorTask } from './interpretor-task/interpretor-task';
import { InterpretorBreadCrumb } from './interpretor-breadcrumb/interpretor-breadcrumb';
import { InterpretorUtils, FindTaskDto } from '../interpretor-utils/interpretor-utils';
import { InterpretorOperations } from './interpretor-operations/interpretor-operations';
import { InterpretorSo } from './interpretor-so/interpretor-so';
import { DownloadDataDto } from '../dto';
import { InterpretorSubject } from '../interpretor-subject/interpretor-subject';
import { InterpretorAbstract } from '../interpretor-abstract/interpretor-abstract';
import { InterpretorMetrics } from '../interpretor-metrics/interpretor-metrics';


export class InterpretorReader {

    constructor(
        protected workflowProfil: InterpretorProfiles,
        protected workflowTask: InterpretorTask,
        protected workflowBreadCrumb: InterpretorBreadCrumb,
        protected workflowUtils: InterpretorUtils,
        protected workflowSo: InterpretorSo,
        protected workflowAbstract: InterpretorAbstract,
        protected workflowMetrics: InterpretorMetrics,
        protected workflowSubject?: InterpretorSubject) {
    }

    get date() {
        return new Date().toISOString();
    }

    generateId(instance: WorkflowInstanceDto) {
        return UUID.UUID();
    }

    public moveForward(instance: WorkflowInstanceDto, transitionKey?: string) {
        this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorMoveForward);
        let nextTask: FindTaskDto = null;

        if (instance.stackTasks.length > 0) {
            instance.stackTasks[instance.stackTasks.length - 1].saved = false;
            instance.stackTasks[instance.stackTasks.length - 1].finishDate = this.date;
        }

        if (this.workflowUtils.isNewTask(instance)) {
            nextTask = this._createNextTask(instance, transitionKey);
            if (nextTask.task) {
                this._updateStack(instance, nextTask.task as WorkflowStackTaskDto);
            }
        } else {
            nextTask = this._activeNext(instance);
        }
        this._updateData(instance, nextTask.state);
        this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorMoveForward);
    }

    public finish(instance: WorkflowInstanceDto, save: boolean) {
        if (instance.stackTasks.length > 0) {
            instance.stackTasks[instance.stackTasks.length - 1].saved = false;
            instance.stackTasks[instance.stackTasks.length - 1].finishDate = this.date;
        }
        this._updateData(instance, save ? 'finished' : 'canceled');
    }

    public execute(instance: WorkflowInstanceDto): Observable<InterpretorTaskDto> {
        if (this.workflowUtils.isFinished(instance)) {
            return of(null);
        }

        try {
            instance.participants =
                this.workflowProfil.updateParticipants(instance, this.workflowUtils.getProfilCurrentTask(instance));
        } catch (e) {
            return throwError(e);
        }

        const taskModel = this.workflowUtils.getActiveTaskModel(instance);

        let instanceUpdated = instance;
        // reverse instance just after active task
        if (!this.workflowUtils.isNewTask(instance)) {
            instanceUpdated = _.cloneDeep(instance);
            this.workflowUtils.reverseInstance(instanceUpdated, true);
        }

        if (this.workflowSubject && !this.workflowUtils.isFinished(instance)) {
            this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorMessaging);
            this.workflowSubject.next({
                action: 'execute',
                date: new Date(),
                success: true,
                value: {
                    instance: instanceUpdated,
                    taskModel: taskModel.uuid,
                }
            });
            this.workflowSubject.debug(instanceUpdated);
            this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorMessaging);
        }
        const res: InterpretorTaskDto = {
            custom: this.workflowTask.calculateCustom(
                instanceUpdated,
                taskModel),
            stepBreadCrumb: [],
            taskBreadCrumb: this.workflowUtils.isTaskUI(taskModel) ? this.workflowBreadCrumb.calculateTaskBreadCrumb(instance) : [],
            transitions: taskModel.properties.transitions,
            type: taskModel.type,
            instance,
        };

        return of(res);
    }

    public jump(instance: WorkflowInstanceDto, jump: InterpretorJumpDto) {
        let task: WorkflowStackTaskDto = null;

        switch (jump.direction) {
            case InterpretorTypeJump.Jump:
                task = this.workflowUtils.findTask(instance, jump.uuid);
                break;
            case InterpretorTypeJump.Previous:
                task = this.workflowUtils.getPrevious(instance);
                break;
            case InterpretorTypeJump.Next:
                task = this.workflowUtils.getNext(instance);
        }

        if (!task) {
            throw new WorkflowErrorJumped('ERR-129', `{{TARGET-TASK}} {{NOT-FOUND}}`);
        }

        if (this.workflowSubject) {
            this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorMessaging);
            this.workflowSubject.next({
                action: 'jump',
                date: new Date(),
                success: true,
                value: {
                    instance,
                    stackTaskUUID: this.workflowUtils.getActiveTask(instance).uuid,
                    taskModel: this.workflowUtils.getTaskModel(instance, task).uuid,
                    stackTaskToJumpUUID: task.uuid,
                    direction: jump.direction,
                }
            });
            this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorMessaging);
        }

        // canjump
        if (!(jump.options && jump.options.force)) {
            if (!this.workflowUtils.canJump(instance, task)) {
                throw new WorkflowErrorJumped('ERR-130', `{{NOT-AUTHORIZED}} :{{TASK}} ${task.uuid} {{NOT-AUTHORIZED}}`);
            }
        }

        this._activeTask(instance, task);

        // reverse
        if (jump.options && jump.options.reverse) {
            this.workflowUtils.reverseInstance(instance);
        }
    }

    public validate(instance: WorkflowInstanceDto, validate: InterpretorValidateDto): Observable<any> {
        const mustBeReversed = this.workflowUtils.mustBeReversed(instance, validate);

        // jump
        if (!this.workflowUtils.isNewTask(instance) && !mustBeReversed) {
            this.jump(instance, { direction: InterpretorTypeJump.Next });
            return of({});
        }

        if (mustBeReversed) {
            this.workflowUtils.reverseInstance(instance);
        }

        this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorOperations);
        return this._createOperations(instance, validate).pipe(
            map((operations: WorkflowOperationDto[]) => {
                const data = this._updateSmartObjects(instance, operations);
                this.workflowMetrics.stop(instance.context.metrics,InterpretorMetricsKeys.InterpretorOperations);

                return data;
            }),
            mergeMap((data: WorkflowDataDto[]) => {
                if (instance.stackData) {
                    data.forEach((d) => {
                        const transitionData = this.workflowUtils.getTransitionData(instance, validate.transitionKey, d.key);
                        if (transitionData) {
                            this.workflowUtils.pushStackData(instance, transitionData.uuid, d.value);
                        }
                    });
                }
                this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorDownload);
                return this.workflowSo.downloadData(data, instance.smartobjects, instance.documents,
                    instance.context.smartmodels, instance.context);
            }),
            map((download: DownloadDataDto) => {
                this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorDownload);
                instance.data = _.uniqBy([...download.datas, ...instance.data], 'key');

                if (this.workflowSubject) {
                    this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorMessaging);
                    this.workflowSubject.next({
                        action: 'validate',
                        date: new Date(),
                        success: true,
                        value: {
                            instance,
                            stackTaskUUID: this.workflowUtils.getActiveTask(instance).uuid,
                            transitionKey: validate.transitionKey,
                            type: this.workflowUtils.isTaskUI(this.workflowUtils.getActiveTaskModel(instance)) ? 'ui' : 'process',
                        }
                    });
                    this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorMessaging);
                }

                this.moveForward(instance, validate.transitionKey);
                return;
            }),
            mergeMap(() => new Promise((resolve) => resolve(null))), // prevent maximum call stack excedeed
        )
    }

    /** public for test */
    _createNextTask(instance: WorkflowInstanceDto, transitionKey?: string): FindTaskDto {
        const findTask: FindTaskDto = transitionKey ? this.workflowUtils.findNextTaskModel(instance, transitionKey) :
            this.workflowUtils.findFirstTaskModel(instance);

        if (!findTask.task) {
            return findTask;
        }

        const task: WorkflowStackTaskDto = {
            uuid: this.generateId(instance),
            active: false,
            startDate: this.date,
            finishDate: null,
            operations: [],
            reverse: [],
            saved: false,
            taskModel: findTask.task.uuid
        };

        return { task, state: findTask.state };
    }

    /** public for test */
    _updateData(instance: WorkflowInstanceDto, state: 'running' | 'finished' | 'canceled') {
        const date = this.date;
        instance.state = state;

        if (this.workflowUtils.isFinished(instance)) {
            instance.finishDate = date;
        } else {
            if (!instance.startDate) {
                instance.startDate = date;
            }
        }

        instance.updateDate = date;
    }

    /** public for test */
    _updateStack(instance: WorkflowInstanceDto, task: WorkflowStackTaskDto) {
        this._activeTask(instance, task);
        instance.stackTasks.push(task);
    }

    /** public for test */
    _activeTask(instance: WorkflowInstanceDto, task: WorkflowStackTaskDto) {
        try {
            this.workflowUtils.getActiveTask(instance).active = false;
        } catch (e) {
        }
        task.active = true;
    }

    /** public for test */
    _activeNext(instance: WorkflowInstanceDto): FindTaskDto {
        const indexActive = instance.stackTasks.indexOf(this.workflowUtils.getActiveTask(instance));

        if (indexActive + 1 >= instance.stackTasks.length) {
            throw new WorkflowErrorReader('ERR-128','{{ACTIVE-INDEX-IS-LAST}}');
        }

        instance.stackTasks[indexActive].active = false;

        const nextTask = instance.stackTasks[indexActive + 1];

        nextTask.active = true;
        return { task: nextTask, state: 'running' };
    }

    /** public for test */
    _updateSmartObjects(instance: WorkflowInstanceDto, operations: WorkflowOperationDto[]) {
        const opService = new InterpretorOperations(instance.data, instance.smartobjects, instance.documents,
            instance.context?.custom?.indexes);
        const data = operations.reduce((results, op) => {
            results.push(...opService.executeOperation(op));
            return results;
        }, []);
        opService.free();

        return data;
    }

    assignOperations(activeTask: WorkflowStackTaskDto, opService: InterpretorOperations) {
        activeTask.operations = opService.operations;
        activeTask.reverse = opService.reverses;
    }

    /** public for test */
    _createOperations(instance: WorkflowInstanceDto, validate: InterpretorValidateDto): Observable<WorkflowOperationDto[]> {
        const opService = new InterpretorOperations(instance.data, instance.smartobjects, instance.documents,
            instance.context?.custom?.indexes);

        const activeTask = this.workflowUtils.getActiveTask(instance);
        const activeTaskModel = this.workflowUtils.getActiveTaskModel(instance);
        const transition = activeTaskModel.properties.transitions.find((t) => t.key === validate.transitionKey);

        for (const transfer of validate.transfers) {
            opService.createOperation(transfer, transition);
        }

        this.assignOperations(activeTask, opService);

        return (
            opService.assets.length === 0 ?
                of([]) :
                zip(...opService.assets.map(
                    (asset: any) => this.workflowAbstract.setAsset(asset))
                )
        ).pipe(
            map(() => opService.operations),
            tap(() => opService.free()),
        );
    }
}
