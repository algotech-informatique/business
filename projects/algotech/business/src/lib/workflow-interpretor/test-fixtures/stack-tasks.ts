import { WorkflowStackTaskDto } from '@algotech/core';
import { fixtOperationsUpload, fixtOperationsNotifyReviewer,
    fixtReverseNotifyReviewer, fixtOperationsNotifyEmitter,
    fixtReverseNotifyEmitter, fixtOperationsNewDocument,
    fixtReverseNewDocument } from './operations';

export const fixtStackTaskSelect: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155a',
    taskModel: '6b443bbe-1b2d-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskNewDocumentOp: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f7901550',
    taskModel: 'e7d81563-6adb-a84a-4d1a-31295dd55205',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: fixtOperationsNewDocument,
    reverse: fixtReverseNewDocument,
    saved: false,
};

export const fixtStackTaskNewDocument: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f7901550',
    taskModel: 'e7d81563-6adb-a84a-4d1a-31295dd55205',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskUpload: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155b',
    taskModel: '793461b8-1b2d-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskUploadOp: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155b',
    taskModel: '793461b8-1b2d-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: fixtOperationsUpload,
    reverse: [],
    saved: false,
};

export const fixtStackTaskForm: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155c',
    taskModel: '893287ba-1b2e-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskNotifyReviewerOp: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155d',
    taskModel: 'd951a0be-1b2e-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: fixtOperationsNotifyReviewer,
    reverse: fixtReverseNotifyReviewer,
    saved: false,
};

export const fixtStackTaskCheckNotifyReviewer: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155e',
    taskModel: 'eb51f0d4-1b2e-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskNotifyAll01: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155f',
    taskModel: '2adafc78-1b2f-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskNotifyEmitter: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155g',
    taskModel: '3be361cc-1b2f-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: fixtOperationsNotifyEmitter,
    reverse: fixtReverseNotifyEmitter,
    saved: false,
};

export const fixtStackTaskComment: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155h',
    taskModel: '4b63f940-1b2f-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskNotifyAll02: WorkflowStackTaskDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155i',
    taskModel: '6446c8b6-1b2f-11e9-ab14-d663bd873d93',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskStepBreadCrumbList0: WorkflowStackTaskDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39011',
    taskModel: '601dfc62-d749-be7c-14f7-f6914b0f982e',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskStepBreadCrumbUpload0: WorkflowStackTaskDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39013',
    taskModel: 'f0309170-663c-040c-0130-e96e2b90c271',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskStepBreadCrumbCreateObject0: WorkflowStackTaskDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39015',
    taskModel: '24c03b0e-7468-0fbc-ca03-0d4ff0753743',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskStepBreadCrumbCreateObject1: WorkflowStackTaskDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39016',
    taskModel: '4b072630-f724-76a2-16ac-1b351c45dc47',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskStepBreadCrumbList1: WorkflowStackTaskDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39012',
    taskModel: '3fa348da-d81c-5999-5983-76cac3b1db70',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};

export const fixtStackTaskStepBreadCrumbUpload1: WorkflowStackTaskDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39014',
    taskModel: 'bf0be16f-8849-b9c7-44bc-a03359153c2a',
    startDate: '2019-04-01T18:25:43.511Z',
    finishDate: '2019-04-02T18:25:43.511Z',
    active: false,
    operations: [],
    reverse: [],
    saved: false,
};
