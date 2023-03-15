import { WorkflowBreadCrumbService } from './workflow-breadcrumb.service';
import { WorkflowInstanceDto } from '@algotech/core';
import * as _ from 'lodash';
import {
    fixtWorkflowInstanceTodo,
    fixtWorkflowInstanceJumpedBeforeNotifyReviewer,
    fixtWorkflowInstanceCheckReviewers,
    fixtWorkflowInstanceBeforeLoop,
    fixtWorkflowInstanceJumpedBeforeNotifyEmitter,
    fixtWorkflowInstanceStepBreadCrumbForNext,
    fixtWorkflowInstanceStepBreadCrumbForPrevious} from '../../test-fixtures/workflow-instances';
import { fixtStackTaskSelect } from '../../test-fixtures/stack-tasks';
import {
    fixtTaskBreadCrumbTodo,
    fixtTaskBreadCrumbNotifyReviewers,
    fixtTaskBreadCrumbCheckNotifyReviewers,
    fixStepBreadCrumbDtoDocument,
    fixStepBreadCrumbDtoRevision,
    fixStepBreadCrumbDtoReview,
    fixtTaskBreadCrumbPreviousAvoidLastTask,
    fixtTaskBreadCrumbNextAvoidFirstTask} from '../../test-fixtures/bread-crumb';
import { inject, TestBed } from '@angular/core/testing';
import { AppTestModule } from '../../test-fixtures/mock/app.test.module';

describe('WorkflowReaderService', () => {

    let workflowBreadCrumbService: WorkflowBreadCrumbService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([WorkflowBreadCrumbService],
        async (
            _workflowBreadCrumbService: WorkflowBreadCrumbService) => {
            workflowBreadCrumbService = _workflowBreadCrumbService;
        }));

    it('calculateTaskBreadCrumb - todo', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceTodo);
        instance.stackTasks.push(
            Object.assign(_.cloneDeep(fixtStackTaskSelect), { active: true })
        );

        expect(workflowBreadCrumbService.calculateTaskBreadCrumb(instance)).toEqual(fixtTaskBreadCrumbTodo);
    });

    it('calculateTaskBreadCrumb - running', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeNotifyReviewer);

        expect(workflowBreadCrumbService.calculateTaskBreadCrumb(instance)).toEqual(fixtTaskBreadCrumbNotifyReviewers);
    });

    it('calculateTaskBreadCrumb - with unknow next transition', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);

        expect(workflowBreadCrumbService.calculateTaskBreadCrumb(instance)).toEqual(fixtTaskBreadCrumbCheckNotifyReviewers);
    });

    it('calculateStepBreadCrumb - todo (unknow next step)', () => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceTodo);
        instance.stackTasks.push(
            Object.assign(_.cloneDeep(fixtStackTaskSelect), { active: true })
        );

        expect(workflowBreadCrumbService.calculateStepBreadCrumb(instance)).toEqual(fixStepBreadCrumbDtoDocument);
    });

    it('calculateStepBreadCrumb - running', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceBeforeLoop);
        expect(workflowBreadCrumbService.calculateStepBreadCrumb(instance)).toEqual(fixStepBreadCrumbDtoRevision);
    });

    it('calculateStepBreadCrumb - by jumped', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeNotifyEmitter);
        expect(workflowBreadCrumbService.calculateStepBreadCrumb(instance)).toEqual(fixStepBreadCrumbDtoReview);
    });

    it('calculateStepBreadCrumb - check avoid first task (next)', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceStepBreadCrumbForNext);
        expect(workflowBreadCrumbService.calculateStepBreadCrumb(instance)).toEqual(fixtTaskBreadCrumbNextAvoidFirstTask);
    });

    it('calculateStepBreadCrumb - check avoid last task (previous)', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceStepBreadCrumbForPrevious);
        expect(workflowBreadCrumbService.calculateStepBreadCrumb(instance)).toEqual(fixtTaskBreadCrumbPreviousAvoidLastTask);
    });
});
