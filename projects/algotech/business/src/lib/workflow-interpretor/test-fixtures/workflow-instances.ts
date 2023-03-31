import { WorkflowInstanceDto, WorkflowSettingsDto } from '@algotech-ce/core';
import { fixtStackTaskSelect, fixtStackTaskUploadOp, fixtStackTaskForm, fixtStackTaskNotifyReviewerOp,
    fixtStackTaskCheckNotifyReviewer, fixtStackTaskNotifyEmitter,
    fixtStackTaskComment, fixtStackTaskNotifyAll01,
    fixtStackTaskUpload, fixtStackTaskNewDocument, fixtStackTaskNewDocumentOp,
    fixtStackTaskStepBreadCrumbList0, fixtStackTaskStepBreadCrumbList1,
    fixtStackTaskStepBreadCrumbUpload0, fixtStackTaskStepBreadCrumbCreateObject0,
    fixtStackTaskStepBreadCrumbUpload1, fixtStackTaskStepBreadCrumbCreateObject1 } from './stack-tasks';
import { fixtDataWorkflow } from './data';
import { fixtSmartObjects } from './smart-objects';
import { fixtWorkflowModel1, fixtWorkflowModelStepBreadCrumb } from './workflow-models';
import * as _ from 'lodash';

export const fixtSettings: WorkflowSettingsDto = {
    workflowUuid: fixtWorkflowModel1.uuid,
    securityGroup: [{
        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
        group: 'technician',
        login: '',
    }, {
        profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
        group: 'admin',
        login: ''
    }],
    context: '',
    filters: [],
    platforms: [],
    savingMode: 'END',
    unique: false
};

export const fixtSettingsNotValid: WorkflowSettingsDto = {
    workflowUuid: fixtWorkflowModel1.uuid,
    securityGroup: [{
        profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93AAAAAAAAAA',
        group: 'admin',
        login: '',
    }],
    context: '',
    filters: [],
    platforms: [],
    savingMode: 'END',
    unique: false
};

export const fixtWorkflowInstanceTodo: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155a',
    createdDate: null,
    finishDate: null,
    startDate: null,
    updateDate: null,
    data: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: [],
    documents: [],
    stackTasks: [],
    stackData: [],
    state: 'todo',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceCheckReviewers: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155b',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        Object.assign(_.cloneDeep(fixtStackTaskCheckNotifyReviewer), { active: true })
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceBeforeLoop: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155c',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        fixtStackTaskCheckNotifyReviewer,
        fixtStackTaskNotifyEmitter,
        Object.assign(_.cloneDeep(fixtStackTaskComment), { active: true })
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceBeforeFinish: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155d',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        fixtStackTaskCheckNotifyReviewer,
        Object.assign(_.cloneDeep(fixtStackTaskNotifyAll01), { active: true })
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceJumped: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155e',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        Object.assign(_.cloneDeep(fixtStackTaskCheckNotifyReviewer), { active: true }),
        fixtStackTaskNotifyAll01
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceJumpedBeforeNotifyReviewer: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155f',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        Object.assign(_.cloneDeep(fixtStackTaskNotifyReviewerOp), { active: true }),
        fixtStackTaskCheckNotifyReviewer,
        fixtStackTaskNotifyAll01
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceJumpedBeforeNotifyEmitter: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155g',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        fixtStackTaskCheckNotifyReviewer,
        Object.assign(_.cloneDeep(fixtStackTaskNotifyEmitter), { active: true }),
        fixtStackTaskComment,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceJumpedBeforeNewDocument: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155h',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        Object.assign(_.cloneDeep(fixtStackTaskNewDocumentOp), { active: true }),
        fixtStackTaskUploadOp,
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        fixtStackTaskCheckNotifyReviewer,
        fixtStackTaskNotifyEmitter,
        fixtStackTaskComment,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceJumpedBeforeUpload: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155i',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        Object.assign(_.cloneDeep(fixtStackTaskUploadOp), { active: true }),
        fixtStackTaskForm,
        fixtStackTaskNotifyReviewerOp,
        fixtStackTaskCheckNotifyReviewer,
        fixtStackTaskNotifyEmitter,
        fixtStackTaskComment,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceSelect: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f79015bb',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        Object.assign(_.cloneDeep(fixtStackTaskSelect), { active: true }),
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceSelectAfterJump: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f7901ccc',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        Object.assign(_.cloneDeep(fixtStackTaskSelect), { active: true }),
        fixtStackTaskNewDocument,
        fixtStackTaskUpload,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceNewDocument: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155j',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        Object.assign(_.cloneDeep(fixtStackTaskNewDocument), { active: true }),
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceUpload: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155k',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        Object.assign(_.cloneDeep(fixtStackTaskUpload), { active: true }),
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceForm: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f79015gg',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskSelect,
        fixtStackTaskNewDocument,
        fixtStackTaskUpload,
        Object.assign(_.cloneDeep(fixtStackTaskForm), { active: true }),
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceReverseApiTagBefore: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155l',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    saved: true,
    stackTasks: [
        Object.assign(_.cloneDeep(fixtStackTaskSelect), { saved: true }),
        fixtStackTaskNewDocumentOp,
        fixtStackTaskUploadOp,
        Object.assign(_.cloneDeep(fixtStackTaskForm), { active: true }),
        fixtStackTaskNotifyReviewerOp,
        fixtStackTaskCheckNotifyReviewer,
        fixtStackTaskNotifyEmitter,
        fixtStackTaskComment,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceReverseApiTagAfter: WorkflowInstanceDto = {
    uuid: '031fa2ba-b758-4885-8d93-d430f790155m',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        Object.assign(_.cloneDeep(fixtStackTaskSelect), {saved: true}),
        Object.assign(_.cloneDeep(fixtStackTaskNewDocument), {saved: true}),
        Object.assign(_.cloneDeep(fixtStackTaskUploadOp), { active: true, saved: true }),
        Object.assign(_.cloneDeep(fixtStackTaskForm), {saved: true}),
        Object.assign(_.cloneDeep(fixtStackTaskNotifyReviewerOp), {saved: true}),
        Object.assign(_.cloneDeep(fixtStackTaskCheckNotifyReviewer), {saved: true}),
        fixtStackTaskNotifyEmitter,
        fixtStackTaskComment,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModel1
};

export const fixtWorkflowInstanceStepBreadCrumbForNext: WorkflowInstanceDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39011',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        Object.assign(_.cloneDeep(fixtStackTaskStepBreadCrumbList0), { active: true }),
        fixtStackTaskStepBreadCrumbUpload0,
        fixtStackTaskStepBreadCrumbCreateObject0,
        fixtStackTaskStepBreadCrumbCreateObject1,
        fixtStackTaskStepBreadCrumbList1,
        fixtStackTaskStepBreadCrumbUpload1,
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModelStepBreadCrumb
};

export const fixtWorkflowInstanceStepBreadCrumbForPrevious: WorkflowInstanceDto = {
    uuid: 'b2cfa5ed-d846-4e1e-9a05-8f583aa39011',
    createdDate: '2019-04-01T18:25:43.511Z',
    finishDate: null,
    startDate: '2019-04-05T18:25:43.511Z',
    updateDate: '2019-04-05T18:25:43.511Z',
    data: fixtDataWorkflow,
    stackTasks: [
        fixtStackTaskStepBreadCrumbList0,
        fixtStackTaskStepBreadCrumbUpload0,
        fixtStackTaskStepBreadCrumbCreateObject0,
        fixtStackTaskStepBreadCrumbCreateObject1,
        fixtStackTaskStepBreadCrumbList1,
        Object.assign(_.cloneDeep(fixtStackTaskStepBreadCrumbUpload1), { active: true }),
    ],
    stackData: [],
    participants: [],
    settings: fixtSettings,
    smartobjects: fixtSmartObjects,
    documents: [],
    state: 'running',
    workflowModel: fixtWorkflowModelStepBreadCrumb
};

export const workflowInstances: WorkflowInstanceDto[] = [
    fixtWorkflowInstanceBeforeFinish,
    fixtWorkflowInstanceBeforeLoop,
    fixtWorkflowInstanceCheckReviewers,
    fixtWorkflowInstanceJumped,
    fixtWorkflowInstanceJumpedBeforeNewDocument,
    fixtWorkflowInstanceJumpedBeforeNotifyEmitter,
    fixtWorkflowInstanceJumpedBeforeNotifyReviewer,
    fixtWorkflowInstanceJumpedBeforeUpload,
    fixtWorkflowInstanceNewDocument,
    fixtWorkflowInstanceReverseApiTagAfter,
    fixtWorkflowInstanceReverseApiTagBefore,
    fixtWorkflowInstanceTodo,
    fixtWorkflowInstanceUpload
];


