import { CustomResolverParams, InterpretorTaskDto } from '../../../../interpretor/src/dto';
import { fixtTaskBreadCrumbUpload, fixtTaskBreadCrumbTodo,
    fixtTaskBreadCrumbCheckNotifyReviewersAfterJump, fixtTaskBreadCrumbDocumentForm } from './bread-crumb';
import { fixtSmartflowService, fixtWorkflowModel1 } from './workflow-models';
import { Observable, of } from 'rxjs';
import { fixtSODocument_02 } from './smart-objects';
import { SmartObjectDto, PairDto, NotificationDto } from '@algotech/core';
import { fixtSysNotify } from './sys-objects';

export const fixtInterpretorFirstTask: InterpretorTaskDto = {
    type: 'TaskList',
    custom: {
        items: ((params?: CustomResolverParams): Observable<any> => null ),
    },
    transitions: fixtWorkflowModel1.steps[0].tasks.find((t) => t.key === 'equipement-selection').properties.transitions,
    taskBreadCrumb: fixtTaskBreadCrumbTodo,
    stepBreadCrumb: [],
    instance: null,
};

export const fixtInterpretorTaskUpload: InterpretorTaskDto = {
    type: 'TaskUpload',
    custom: {
        multiple: ((params?: CustomResolverParams): Observable<boolean> => of(false))
    },
    transitions: fixtWorkflowModel1.steps[0].tasks.find((t) => t.key === 'document-upload').properties.transitions,
    taskBreadCrumb: fixtTaskBreadCrumbUpload,
    stepBreadCrumb: [],
    instance: null,
};

export const fixtInterpretorTaskFormDocument: InterpretorTaskDto = {
    type: 'TaskForm',
    custom: {
        object: ((params?: CustomResolverParams): Observable<SmartObjectDto> => of(fixtSODocument_02))
    },
    transitions: fixtWorkflowModel1.steps[0].tasks.find((t) => t.key === 'document-form').properties.transitions,
    taskBreadCrumb: fixtTaskBreadCrumbDocumentForm,
    stepBreadCrumb: [],
    instance: null,
};

export const fixtInterpretorTaskCheckNotifyReviewer: InterpretorTaskDto = {
    type: 'TaskReview',
    custom: {
        object: ((params?: CustomResolverParams): Observable<NotificationDto> => of(fixtSysNotify))
    },
    transitions: fixtWorkflowModel1.steps[1].tasks.find((t) => t.key === 'reviewers-check').properties.transitions,
    taskBreadCrumb: fixtTaskBreadCrumbCheckNotifyReviewersAfterJump,
    stepBreadCrumb: [],
    instance: null,
};

export const fixtInterpretorService: InterpretorTaskDto = {
    type: 'TaskService',
    custom: {
    },
    transitions: fixtSmartflowService.steps[0].tasks.find((t) => t.key === 'service').properties.transitions,
    taskBreadCrumb: [],
    stepBreadCrumb: [],
    instance: null,
};