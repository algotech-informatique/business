import { InterpretorUtils } from '../../interpretor-utils/interpretor-utils';
import { LangDto, WorkflowStackTaskDto, WorkflowStepModelDto, TaskModelDto, WorkflowInstanceDto } from '@algotech/core';
import { BreadCrumbDto } from '../../dto';

export class InterpretorBreadCrumb {

    constructor(protected workflowUtils: InterpretorUtils) { }

    private _tasks: TaskModelDto[] = [];
    private _steps: WorkflowStepModelDto[] = [];

    public calculateStepBreadCrumb(instance: WorkflowInstanceDto): BreadCrumbDto[] {
        const stackTasksReduce = this.workflowUtils.stackTasksReduce(instance);
        const res: BreadCrumbDto[] = [];
        const tasks = this.workflowUtils.getAllTasks(instance);

        this._tasks = [];
        this._steps = [];

        res.push(...this.calculateStepBreadCrumbBefore(instance));
        res.push(...this.calculateStepBreadCrumbAfter(instance));

        let taskModel = this.workflowUtils.getTaskModel(instance, stackTasksReduce[stackTasksReduce.length - 1]);

        // rest of step
        while (taskModel) {
            if (taskModel.properties.transitions.length === 1) {

                taskModel = tasks.find((s) => s.uuid === taskModel.properties.transitions[0].task);

                if (taskModel) {
                    const stepModel = this.workflowUtils.getStep(instance, taskModel);

                    // check loop task
                    if (this._tasks.indexOf(taskModel) === -1) {
                        this._tasks.push(taskModel);

                        // uniq
                        if (this._steps.indexOf(stepModel) === -1) {
                            this._steps.push(stepModel);
                            res.push(this._getNewBreadCrumb(instance, stepModel.displayName, taskModel, false));
                        }
                    } else {
                        taskModel = null;
                    }
                }
            } else {
                taskModel = null;
            }
        }

        return res;
    }

    public calculateStepBreadCrumbAfter(instance: WorkflowInstanceDto): BreadCrumbDto[] {
        const stackTasksReduce = this.workflowUtils.stackTasksReduce(instance);
        const res: BreadCrumbDto[] = [];
        const iActiveTask = stackTasksReduce.findIndex((t) => t.active);
        const activeTaskModel = this.workflowUtils.getActiveTaskModel(instance);
        const activeStepModel = this.workflowUtils.getStep(instance, activeTaskModel);

        let task: WorkflowStackTaskDto = null;
        let taskModel: TaskModelDto = null;
        let stepModel: WorkflowStepModelDto = null;
        let breadCrumb: BreadCrumbDto = null;

        // after & equal current step
        for (let i = iActiveTask; i < stackTasksReduce.length; i++) {
            task = stackTasksReduce[i];
            taskModel = this.workflowUtils.getTaskModel(instance, task);
            stepModel = this.workflowUtils.getStep(instance, taskModel);

            if (this._steps.indexOf(stepModel) === -1) {
                this._steps.push(stepModel);
                breadCrumb = this._getNewBreadCrumb(instance, stepModel.displayName, taskModel, stepModel === activeStepModel, task);
                res.push(breadCrumb);
            } else {
                if (!breadCrumb.stackUUID && stepModel !== activeStepModel && this.workflowUtils.canJump(instance, task)) {
                    breadCrumb.stackUUID = task.uuid;
                }
            }
        }

        return res;
    }

    public calculateStepBreadCrumbBefore(instance: WorkflowInstanceDto): BreadCrumbDto[] {
        const stackTasksReduce = this.workflowUtils.stackTasksReduce(instance);
        const res: BreadCrumbDto[] = [];
        const iActiveTask = stackTasksReduce.findIndex((t) => t.active);
        const activeTaskModel = this.workflowUtils.getActiveTaskModel(instance);
        const activeStepModel = this.workflowUtils.getStep(instance, activeTaskModel);

        let task: WorkflowStackTaskDto = null;
        let taskModel: TaskModelDto = null;
        let stepModel: WorkflowStepModelDto = null;
        let breadCrumb: BreadCrumbDto = null;

        // before current step
        for (let i = iActiveTask - 1; i >= 0; i--) {
            task = stackTasksReduce[i];
            taskModel = this.workflowUtils.getTaskModel(instance, task);
            stepModel = this.workflowUtils.getStep(instance, taskModel);

            if (stepModel !== activeStepModel) {
                if (this._steps.indexOf(stepModel) === -1) {
                    this._steps.unshift(stepModel);
                    breadCrumb = this._getNewBreadCrumb(
                        instance, stepModel.displayName, taskModel, stepModel === activeStepModel, task);
                    res.unshift(breadCrumb);
                } else {
                    if (!breadCrumb.stackUUID && stepModel !== activeStepModel && this.workflowUtils.canJump(instance, task)) {
                        breadCrumb.stackUUID = task.uuid;
                    }
                }
            }
        }

        return res;
    }

    public calculateTaskBreadCrumb(instance: WorkflowInstanceDto): BreadCrumbDto[] {
        const stackTasksReduce = this.workflowUtils.stackTasksReduce(instance);
        const activeTaskModel = this.workflowUtils.getActiveTaskModel(instance);
        const activeStepModel = this.workflowUtils.getStep(instance, activeTaskModel);

        this._tasks = [];

        const insideStep = (i: number): boolean => {
            if (i < 0) {
                return false;
            }
            return activeStepModel.tasks.find((s) => s.uuid === stackTasksReduce[i].taskModel) !== undefined;
        };

        const res: BreadCrumbDto[] = [];
        const iStackActive = stackTasksReduce.indexOf(this.workflowUtils.getActiveTask(instance));
        let iStack = iStackActive;

        // back to first task inside step
        while (insideStep(iStack - 1)) {
            iStack--;
        }

        let task: WorkflowStackTaskDto = null;
        let taskModel: TaskModelDto = null;

        // task inside stack
        for (let i = iStack; i < stackTasksReduce.length; i++) {
            task = stackTasksReduce[i];
            taskModel = this.workflowUtils.getTaskModel(instance, task);

            if (!insideStep(i)) {
                break;
            }

            // check task ui
            if (this.workflowUtils.isTaskUI(taskModel)) {
                res.push(this._getNewBreadCrumb(
                    instance, taskModel.general.displayName, taskModel, i === iStackActive, task));
            }
        }

        // rest of task
        while (taskModel) {
            if (taskModel.properties.transitions.length === 1) {
                taskModel = activeStepModel.tasks.find((s) => s.uuid === taskModel.properties.transitions[0].task);
                if (taskModel) {
                    // uniq
                    if (this._tasks.indexOf(taskModel) === -1) {
                        this._tasks.unshift(taskModel);

                        // check task ui
                        if (this.workflowUtils.isTaskUI(taskModel)) {
                            res.push(this._getNewBreadCrumb(
                                instance, taskModel.general.displayName, taskModel, false));
                        }
                    } else {
                        taskModel = null;
                    }
                }
            } else {
                taskModel = null;
            }
        }

        return res;
    }

    /** public for test */
    _getNewBreadCrumb(instance: WorkflowInstanceDto, displayName: LangDto[],
        taskModel: TaskModelDto, active: boolean, task?: WorkflowStackTaskDto): BreadCrumbDto {
        const profilTask = this.workflowUtils.getProfilTask(instance, taskModel);
        const profilName = profilTask ? profilTask.name : '';
        const profil = taskModel ? profilName : '';
        const breadCrumb: BreadCrumbDto = {
            displayName,
            profil,
            active
        };

        if (task) {
            if (!breadCrumb.active && this.workflowUtils.canJump(instance, task)) {
                breadCrumb.stackUUID = task.uuid;
            }
        }

        return breadCrumb;
    }
}
