import { WorkflowUtilsService } from './workflow-utils.service';
import * as _ from 'lodash';
import {
    fixtWorkflowInstanceTodo,
    fixtWorkflowInstanceCheckReviewers,
    fixtWorkflowInstanceBeforeFinish,
    fixtWorkflowInstanceJumped,
    fixtWorkflowInstanceBeforeLoop,
    fixtWorkflowInstanceJumpedBeforeUpload,
    fixtWorkflowInstanceJumpedBeforeNotifyReviewer,
    fixtWorkflowInstanceJumpedBeforeNewDocument,
    fixtWorkflowInstanceForm
} from '../test-fixtures/workflow-instances';
import { TaskModelDto, WorkflowInstanceDto } from '@algotech/core';
import {
    fixtWorkflowModelErrorNoEntryPoint,
    fixtWorkflowModelErrorManyEntryPoints,
    fixtServiceEnd
} from '../test-fixtures/workflow-models';
import {
    WorkflowErrorModelNotValid,
    WorkflowErrorTransitionNotFind,
    WorkflowErrorTaskNotFind,
    WorkflowErrorActiveTaskNotFind
} from '../../../../interpretor/src/error/interpretor-error';
import { fixtStackTaskCheckNotifyReviewer, fixtStackTaskForm, fixtStackTaskUpload } from '../test-fixtures/stack-tasks';
import {
    fixtValidateLoop,
    fixtValidateJumpRead,
    fixtValidateUpload,
    fixtValidateJumpChangeTransition,
    fixtValidateJumpWrite
} from '../test-fixtures/interpretor-validate';
import {
    fixtSODocument_NEW,
    fixtSOEquipment_01,
    fixtSODocument_01,
    fixtSODocument_02
} from '../test-fixtures/smart-objects';
import { inject, TestBed } from '@angular/core/testing';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';

describe('WorkflowUtilsService', () => {

    let workflowUtilsService: WorkflowUtilsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([WorkflowUtilsService],
        async (_workflowUtilsService: WorkflowUtilsService) => {
            workflowUtilsService = _workflowUtilsService;
        }));

    it('findFirstTaskModel', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceTodo);
        expect(workflowUtilsService.findFirstTaskModel(instance).task.uuid).toBe('6b443bbe-1b2d-11e9-ab14-d663bd873d93');
    });

    it('findFirstTaskModel - error workflow doesn\'t has entry point', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceTodo);
        instance.workflowModel = fixtWorkflowModelErrorNoEntryPoint;

        expect(() => { workflowUtilsService.findFirstTaskModel(instance); }).toThrowError(WorkflowErrorModelNotValid);
    });

    it('findFirstTaskModel - error workflow has several entry points', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceTodo);
        instance.workflowModel = fixtWorkflowModelErrorManyEntryPoints;

        expect(() => { workflowUtilsService.findFirstTaskModel(instance); }).toThrowError(WorkflowErrorModelNotValid);
    });

    it('findNextTaskModel', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);
        expect(workflowUtilsService.findNextTaskModel(instance, 'ok').task.uuid).toBe('2adafc78-1b2f-11e9-ab14-d663bd873d93');
    });

    it('findNextTaskModel - before finished (with finisher)', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        expect((workflowUtilsService.findNextTaskModel(instance, 'notify').task as TaskModelDto).type).toBe('TaskFinisher');
    });

    it('findNextTaskModel - before finished (without finisher)', () => {
        // prepare data
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        const step = instance.workflowModel.steps.find((s) => s.key === 'review');
        const finisher = step.tasks.find((t) => t.type === 'TaskFinisher');
        const beforeFinisher = step.tasks.find((t) => t.properties.transitions[0].task === finisher.uuid);

        beforeFinisher.properties.transitions[0].task = null;
        _.remove(step.tasks, (t: TaskModelDto) => t.type === 'TaskFinisher');

        // test
        expect(workflowUtilsService.findNextTaskModel(instance, 'notify').task).toBeUndefined();
    });

    it('findNextTaskModel - error transition not find', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        expect(() => { workflowUtilsService.findNextTaskModel(instance, 'faketransition'); }).toThrowError(WorkflowErrorTransitionNotFind);
    });

    it('findNextTaskModel - error next task not find', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);

        workflowUtilsService.getActiveTaskModel(instance).properties.transitions.find((t) => t.key === 'ok').task = 'faketask';
        expect(() => { workflowUtilsService.findNextTaskModel(instance, 'ok'); }).toThrowError(WorkflowErrorTaskNotFind);
    });

    it('getActiveTask', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumped);
        expect(workflowUtilsService.getActiveTask(instance).uuid).toBe(fixtStackTaskCheckNotifyReviewer.uuid);
    });

    it('getActiveTask - error not find', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceTodo);
        expect(() => { workflowUtilsService.getActiveTask(instance); }).toThrowError(WorkflowErrorActiveTaskNotFind);
    });

    it('getActiveTaskModel', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumped);
        const taskCompare = workflowUtilsService.getAllTasks(instance).find((t) => t.uuid === fixtStackTaskCheckNotifyReviewer.taskModel);
        expect(workflowUtilsService.getActiveTaskModel(instance)).toEqual(taskCompare);
    });

    it('getActiveTaskModel - error not find', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumped);
        workflowUtilsService.getActiveTask(instance).taskModel = 'fakemodel';
        expect(() => { workflowUtilsService.getActiveTaskModel(instance); }).toThrowError(WorkflowErrorActiveTaskNotFind);
    });


    it('findTask - find', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);
        expect(workflowUtilsService.findTask(instance, fixtStackTaskForm.uuid).taskModel).
            toBe('893287ba-1b2e-11e9-ab14-d663bd873d93');
    });

    it('findTask - not find', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);
        expect(workflowUtilsService.findTask(instance, 'not find')).toBeUndefined();
    });

    it('isNewTask - false', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumped);
        expect(workflowUtilsService.isNewTask(instance)).toBeFalsy();
    });

    it('isNewTask - true', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);
        expect(workflowUtilsService.isNewTask(instance)).toBeTruthy();
    });

    it('getProfilCurrentTask - reviewers', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        expect(workflowUtilsService.getProfilCurrentTask(instance)).toEqual(
            instance.workflowModel.profiles[1]
        );
    });

    it('getProfilCurrentTask - error profil not find', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        instance.workflowModel.profiles = [];
        expect(() => { workflowUtilsService.getProfilCurrentTask(instance); }).toThrowError(WorkflowErrorModelNotValid);
    });

    it('reverseInstance - remove', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeNotifyReviewer);
        workflowUtilsService.reverseInstance(instance);

        expect(instance.data.find((d) => d.key === 'notify')).toBeUndefined();
    });

    it('reverseInstance - patch', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeNewDocument);
        const properties: string[] = instance.smartobjects.find((so) => so.uuid === fixtSOEquipment_01.uuid).properties
            .find((p) => p.key === 'DOCUMENTS').value;

        properties.push(fixtSODocument_NEW.uuid);
        workflowUtilsService.reverseInstance(instance);

        expect(JSON.parse(JSON.stringify(instance.smartobjects.find((so) => so.uuid === fixtSOEquipment_01.uuid)))).toEqual(
            fixtSOEquipment_01
        );
    });

    it('reverseInstance - action && reverse more than 1 task', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeNewDocument);

        workflowUtilsService.reverseInstance(instance);
        expect(instance.data.find((d) => d.key === 'notify')).toBeUndefined();
        expect(instance.data.find((d) => d.key === 'document')).toBeUndefined();
        expect(instance.smartobjects.find((d) => d.uuid === fixtSODocument_NEW.uuid)).toBeUndefined();
        expect(instance.smartobjects.find((d) => d.uuid === fixtSOEquipment_01.uuid)
            .properties.find((e) => e.key === 'DOCUMENTS').value).toEqual(
                [
                    fixtSODocument_01.uuid,
                    fixtSODocument_02.uuid
                ]
            );
    });


    it('mustBeReversed - no jump', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceBeforeLoop);
        expect(workflowUtilsService.mustBeReversed(instance, fixtValidateLoop)).toBeFalsy();
    });

    it('mustBeReversed - jump - read (no data)', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumped);
        expect(workflowUtilsService.mustBeReversed(instance, fixtValidateJumpRead)).toBeFalsy();
    });

    it('mustBeReversed - jump - read (no change)', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeUpload);
        expect(workflowUtilsService.mustBeReversed(instance, fixtValidateUpload)).toBeFalsy();
    });

    it('mustBeReversed - jump - changeTransition', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumped);
        expect(workflowUtilsService.mustBeReversed(instance, fixtValidateJumpChangeTransition)).toBeTruthy();
    });

    it('mustBeReversed - jump - write', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeNotifyReviewer);
        expect(workflowUtilsService.mustBeReversed(instance, fixtValidateJumpWrite)).toBeTruthy();
    });

    it('canJump - jump nok change profil', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        expect(workflowUtilsService.canJump(instance, instance.stackTasks[0])).toBeFalsy();
    });

    it('canJump - jump nok service end', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        const task = instance.workflowModel.steps[1].tasks.find((t) => t.key === 'reviewers-check');

        // ajout d'un service de fin
        task.properties.services.push(fixtServiceEnd);

        expect(workflowUtilsService.canJump(instance, instance.stackTasks.find((s) => s.taskModel === task.uuid))).toBeFalsy();
    });

    it('canJump - jump ok', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        expect(workflowUtilsService.canJump(instance, instance.stackTasks[instance.stackTasks.length - 2])).toBeTruthy();
    });

    it('canJump - jump ok  (2)', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceForm);
        expect(workflowUtilsService.canJump(instance, instance.stackTasks.find((s) => s.uuid === fixtStackTaskUpload.uuid))).toBeTruthy();
    });
});
