import { WorkflowInstanceDto, TaskModelDto, WorkflowStackTaskDto, WorkflowProfilModelDto, WorkflowStepModelDto } from '@algotech-ce/core';
import {
    WorkflowErrorModelNotValid,
    WorkflowErrorTransitionNotFind,
    WorkflowErrorTaskNotFind,
    WorkflowErrorActiveTaskNotFind
} from '../error/interpretor-error';
import { InterpretorValidateDto } from '../dto';
import * as _ from 'lodash';
import { InterpretorOperations } from '../interpretor-reader/interpretor-operations/interpretor-operations';
import * as BackgroundTasks from '../interpretor-tasks';
import { TaskBase } from '../interpretor-tasks';
import { ScheduleUtils } from '../@utils/schedule-utils';
import { SkillsUtils } from '../@utils/skills-utils';
import { SoUtils } from '../@utils/so-utils';
import { SysUtils } from '../@utils/sys-utils';
import { ReportsUtils } from '../@utils/reports-utils';
import { InterpretorService } from '../interpretor-reader/interpretor-task/interpretor-service';
import { SmartFlowUtils } from '../@utils/smartflow-utils';
import { TaskUtils } from '../@utils/task-utils';
import { InterpretorSubject } from '../interpretor-subject/interpretor-subject';
import { TaskTransitionDataModelDto } from '@algotech-ce/core';
import { ClassConstructor } from 'class-transformer';

const TASK_LAUNCHER = 'TaskLauncher';
const TASK_LOCK_GO_BACK = 'TaskLockGoBack';

export interface FindTaskDto {
    task?: TaskModelDto | WorkflowStackTaskDto;
    state: 'running' | 'finished' | 'canceled';
}

export class InterpretorUtils {

    constructor(
        protected interpretorService: InterpretorService,
        protected reportUtils: ReportsUtils,
        protected scheduleUtils: ScheduleUtils,
        protected skillsUtils: SkillsUtils,
        protected soUtils: SoUtils,
        protected sysUtils: SysUtils,
        protected smartFlowUtils: SmartFlowUtils,
        protected taskUtils: TaskUtils,
        protected interpretorSubject?: InterpretorSubject) { }

    public stackTasksReduce(instance: WorkflowInstanceDto) {
        const reduce = (stacks) => {
            const taskModels = [];
            let data = null;
            let countPrevious = -1;

            for (let indexUntil = stacks.length - 1; indexUntil >= 0; indexUntil--) {
                const taskModel = stacks[indexUntil].taskModel;
                const count = stacks.filter((s) => s.taskModel === taskModel).length;

                // detect loop
                if (count > 1) {
                    if (count >= countPrevious && taskModels.indexOf(taskModel) === -1) {
                        taskModels.push(taskModel);
                        countPrevious = count;
                        data = {
                            indexLoop: stacks.findIndex((s) => s.taskModel === taskModel),
                            indexUntil
                        };
                    } else {
                        break;
                    }
                }
            }

            if (data) {
                const res: WorkflowStackTaskDto[] = [];
                res.push(...(stacks.splice(data.indexUntil, stacks.length - 1)));
                res.unshift(...(stacks.splice(0, data.indexLoop)));

                return reduce(res); // reduce all loop on the stack (recursive)
            }

            return stacks;
        };

        return reduce(_.clone(instance.stackTasks));
    }

    public isFinished(instance: WorkflowInstanceDto) {
        return instance.state === 'finished' || instance.state === 'canceled';
    }

    public isReadonly(instance: WorkflowInstanceDto) {
        return instance?.settings.savingMode === 'DEBUG';
    }

    public isNewTask(instance: WorkflowInstanceDto): boolean {
        if (instance.stackTasks.length === 0) {
            return true;
        }
        return instance.stackTasks[instance.stackTasks.length - 1].active;
    }

    public getAllTasks(instance: WorkflowInstanceDto): TaskModelDto[] {
        if (!instance.context?.custom) {
            return _.flatMap(instance.workflowModel.steps, 'tasks');
        }
        if (!instance.context.custom.allTasks) {
            instance.context.custom.allTasks = _.flatMap(instance.workflowModel.steps, 'tasks');
        }
        return instance.context.custom.allTasks;
    }

    public findFirstTaskModel(instance: WorkflowInstanceDto): FindTaskDto {
        const tasks = this.getAllTasks(instance);
        const transitionsTask: string[] = [];

        let findTask: TaskModelDto = null;
        for (const task of tasks) {
            for (const transition of task.properties.transitions) {
                transitionsTask.push(transition.task);
            }
        }

        // with launch task
        const tasksLauncher = tasks.filter((t) => t.type === TASK_LAUNCHER);
        if (tasksLauncher.length > 0) {
            if (tasksLauncher.length > 1) {
                throw new WorkflowErrorModelNotValid('ERR-122', `{{SEVERAL-ENTRY-POINTS}}`);
            }
            const launcher = tasksLauncher[0];
            if (transitionsTask.indexOf(launcher.uuid) !== -1) {
                throw new WorkflowErrorModelNotValid('ERR-123', `{{SOME-TASK-TRANSITS-ON-LAUNCH-TASK}}`);
            }
            findTask = tasks.find((t) => t.uuid === launcher.properties.transitions[0].task);
            if (!findTask) {
                throw new WorkflowErrorModelNotValid('ERR-124', `{{LAUNCH-TAST-DOESNT-HAVE-TRANSITION}}`);
            }
            return { task: findTask, state: 'running' };
        }

        // without launch task
        for (const task of tasks) {
            if (transitionsTask.indexOf(task.uuid) === -1) {
                if (findTask) {
                    throw new WorkflowErrorModelNotValid('ERR-125', `{{SEVERAL-ENTRY-POINTS}}`);
                }
                findTask = task;
            }
        }

        if (!findTask) {
            throw new WorkflowErrorModelNotValid('ERR-126', `{{DONT-HAVE-ENTRY-POINTS}}`);
        }
        return { task: findTask, state: 'running' };
    }

    public findNextTaskModel(instance: WorkflowInstanceDto, transitionKey: string, task?: TaskModelDto): FindTaskDto {
        const entryTask = task ? task : this.getActiveTaskModel(instance);
        const transition = entryTask.properties.transitions.find((t) => t.key === transitionKey);
        if (!transition) {
            throw new WorkflowErrorTransitionNotFind('ERR-120', `{{NOT-FOUND}} : ${transitionKey}`);
        }

        const tasks = this.getAllTasks(instance);
        const nextTask = tasks.find((t) => t.uuid === transition.task);

        // finished
        if (!transition.task) {
            return { state: 'finished' };
        }

        if (!nextTask) {
            throw new WorkflowErrorTaskNotFind('ERR-121', `: {{TRANSITION}} ${transition.task} {{NOT-FOUND}}`);
        }

        return { task: nextTask, state: 'running' };
    }

    public findTask(instance: WorkflowInstanceDto, uuid: string): WorkflowStackTaskDto {
        return instance.stackTasks.find((s) => s.uuid === uuid);
    }

    public getActiveTask(instance: WorkflowInstanceDto): WorkflowStackTaskDto {
        if (instance.stackTasks.length > 0 && instance.stackTasks[instance.stackTasks.length - 1].active) {
            return instance.stackTasks[instance.stackTasks.length - 1];
        }
        const activeTask = instance.stackTasks.find((s) => s.active);

        if (!activeTask) {
            throw new WorkflowErrorActiveTaskNotFind('ERR-118', `{{NOT-FOUND}}`);
        }

        return activeTask;
    }

    public getTaskModel(instance: WorkflowInstanceDto, task: WorkflowStackTaskDto): TaskModelDto {
        const tasks = this.getAllTasks(instance);
        const activeTaskModel = tasks.find((t) => t.uuid === task.taskModel);
        if (!activeTaskModel) {
            throw new WorkflowErrorActiveTaskNotFind('ERR-119', `model {{NOT-FOUND}} : ${task.taskModel}`);
        }

        return activeTaskModel;
    }

    public getActiveTaskModel(instance: WorkflowInstanceDto): TaskModelDto {
        const task = this.getActiveTask(instance);
        return this.getTaskModel(instance, task);
    }

    public getProfilTask(instance: WorkflowInstanceDto, taskModel: TaskModelDto) {
        const wfModel = instance.workflowModel;
        if (!taskModel.general.profil) {
            return null;
        }

        const findProfil = wfModel.profiles.find((p) => p.uuid === taskModel.general.profil);
        if (!findProfil) {
            throw new WorkflowErrorModelNotValid('ERR-127', `{{PROFILE-OF}} {{TASK}} ${taskModel.uuid} {{NOT-FOUND}}`);
        }

        return findProfil;
    }

    getTransitionData(instance: WorkflowInstanceDto, transitionKey: string, dataKey: string): TaskTransitionDataModelDto {
        const transition = this.getActiveTaskModel(instance).properties.transitions.find((tr) => tr.key === transitionKey);
        if (!transition) {
            return null;
        }
        return transition.data.find((d) => d.key === dataKey);
    }

    public getProfilCurrentTask(instance: WorkflowInstanceDto): WorkflowProfilModelDto {
        const taskModel = this.getActiveTaskModel(instance);
        return this.getProfilTask(instance, taskModel);
    }

    public getActiveStep(instance: WorkflowInstanceDto): WorkflowStepModelDto {
        return instance.workflowModel.steps.find((s) => s.tasks.indexOf(this.getActiveTaskModel(instance)) !== -1);
    }

    public getStep(instance: WorkflowInstanceDto, task: TaskModelDto): WorkflowStepModelDto {
        return instance.workflowModel.steps.find((s) => s.tasks.indexOf(task) !== -1);
    }

    public pushStackData(instance: WorkflowInstanceDto, key: string, value: any) {
        if (!this.isReadonly(instance) || !instance.stackData) {
            return;
        }
        const find = instance.stackData.find((d) => d.key === key);
        if (find) {
            find.value = value;
        } else {
            instance.stackData.push({
                key,
                value
            })
        }
        if (this.interpretorSubject && this.isTaskUI(this.getActiveTaskModel(instance))) {
            this.interpretorSubject.debug(instance);
        }
    }

    public reverseInstance(instance: WorkflowInstanceDto, afterActive = false) {

        const opService = new InterpretorOperations(instance.data, instance.smartobjects, instance.documents,
            instance.context?.custom?.indexes);
        let indexActive = instance.stackTasks.findIndex((t) => t.active);
        if (afterActive) {
            indexActive++;
        }

        for (let i = instance.stackTasks.length - 1; i >= indexActive; i--) {
            const task = instance.stackTasks[i];
            for (const op of task.reverse) {
                opService.executeOperation(op);
            }
        }

        opService.free();

        if (instance.stackTasks.length > indexActive) {
            instance.stackTasks[indexActive].operations = [];
            instance.stackTasks[indexActive].reverse = [];
        }
        instance.stackTasks.splice(indexActive + 1, instance.stackTasks.length - 1);
    }

    public getPrevious(instance: WorkflowInstanceDto): WorkflowStackTaskDto {
        const stackTasksReduce = this.stackTasksReduce(instance);

        let task: WorkflowStackTaskDto = null;
        if (stackTasksReduce.length > 1) {
            // find the previous task
            let iPrevious = stackTasksReduce.findIndex((s) => s.active) - 1;
            while (!task && iPrevious >= 0) {
                if (this.canJump(instance, stackTasksReduce[iPrevious])) {
                    task = stackTasksReduce[iPrevious];
                }
                iPrevious--;
            }
        }
        return task;
    }

    public getNext(instance: WorkflowInstanceDto): WorkflowStackTaskDto {
        const stackTasksReduce = this.stackTasksReduce(instance);

        let task: WorkflowStackTaskDto = null;
        if (stackTasksReduce.length > 1) {
            // find the previous task
            let iNext = stackTasksReduce.findIndex((s) => s.active) + 1;
            while (!task && iNext < stackTasksReduce.length) {
                if (this.canJump(instance, stackTasksReduce[iNext])) {
                    task = stackTasksReduce[iNext];
                }
                iNext++;
            }
        }
        return task;
    }

    public canPrevious(instance: WorkflowInstanceDto): boolean {
        return this.getPrevious(instance) !== null;
    }

    public canNext(instance: WorkflowInstanceDto): boolean {
        return this.getNext(instance) !== null;
    }

    public getBackgroundTaskClassType(type: string): ClassConstructor<TaskBase> {
        return (BackgroundTasks as any)[`${type}`];
    }

    public createBackgroundTaskInstance(type: string): TaskBase {
        const clsType = this.getBackgroundTaskClassType(type);
        if (!clsType) {
            return null;
        }
        return new clsType(this, this.interpretorService,
            this.reportUtils, this.scheduleUtils, this.skillsUtils, this.soUtils, this.sysUtils, this.smartFlowUtils, this.taskUtils);
    }

    public isLastTask(instance: WorkflowInstanceDto): boolean {
        const task = this.getActiveTaskModel(instance);
        if (task.properties.transitions.length === 1) {
            const nextTask = this.findNextTaskModel(instance, task.properties.transitions[0].key);

            return (nextTask.state === 'finished' || nextTask.state === 'canceled') || (
                instance.settings.savingMode !== 'DEBUG' &&
                (nextTask.task as TaskModelDto).general.profil !== task.general.profil);
        }
        return false;
    }

    public canJump(instance: WorkflowInstanceDto, task: WorkflowStackTaskDto): boolean {
        const stackTasksReduce = this.stackTasksReduce(instance);

        const activeTask = this.getActiveTask(instance);
        const activeTaskModel = this.getActiveTaskModel(instance);
        const iJump = stackTasksReduce.indexOf(task);

        // ASAP, no jump
        if (instance.settings.savingMode === 'ASAP') {
            return false;
        }

        // if active task is the last of the stack (decrement)
        let iActive = stackTasksReduce.indexOf(activeTask);
        if (iActive === stackTasksReduce.length - 1) {
            iActive--;
        }

        for (let i = Math.min(iActive, iJump); i <= Math.max(iActive, iJump); i++) {
            const checkTask = stackTasksReduce[i];
            const checkTaskModel = this.getTaskModel(instance, checkTask);

            // change profil
            if (instance.settings.savingMode !== 'DEBUG' &&
                checkTaskModel.general.profil !== activeTaskModel.general.profil) {
                return false;
            }

            // service end
            if (iActive >= iJump) {
                if (checkTaskModel.properties.services.find((s) => s.execute === 'end')) {
                    return false;
                }
            }

            if (checkTaskModel.type === TASK_LOCK_GO_BACK) {
                return false;
            }
        }

        // task no UI
        if (!this.isTaskUI(this.getTaskModel(instance, task))) {
            return false;
        }

        return true;
    }

    public isTaskUI(task: TaskModelDto) {
        if (this.getBackgroundTaskClassType(task.type)) {
            return false;
        }
        return true;
    }

    public mustBeReversed(instance: WorkflowInstanceDto, validate: InterpretorValidateDto): boolean {
        // no jump
        if (this.isNewTask(instance)) {
            return false;
        }
        const stackTasksReduce = this.stackTasksReduce(instance);

        // change transition
        const indexActive = stackTasksReduce.indexOf(this.getActiveTask(instance));
        if (this.findNextTaskModel(instance, validate.transitionKey).task !==
            this.getTaskModel(instance, stackTasksReduce[indexActive + 1])) {
            return true;
        }

        // compare operations (read|write) : reverse and simulate create operations
        const instanceCopy: WorkflowInstanceDto = _.cloneDeep(instance);
        this.reverseInstance(instanceCopy);

        const opService = new InterpretorOperations(instanceCopy.data, instanceCopy.smartobjects, instanceCopy.documents,
            instance.context?.custom?.indexes);
        const transition = this.getActiveTaskModel(instance).properties.transitions.find((t) => t.key === validate.transitionKey);

        for (const transfer of validate.transfers) {
            opService.createOperation(transfer, transition);
        }

        if (_.isEqual(opService.operations, this.getActiveTask(instance).operations)) {
            opService.free();
            return false;
        }

        opService.free();
        return true;
    }

    public mustBeReversedOperations(instance: WorkflowInstanceDto): boolean {
        const indexActive = _.findIndex(instance.stackTasks, (t) => t.active);
        for (let i = indexActive + 1; i < instance.stackTasks.length; i++) {
            if (instance.stackTasks[i].operations.length > 0) {
                return true;
            }
        }
        return false;
    }
}
