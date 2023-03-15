import { WorkflowOperationDto } from '@algotech/core';
import {
    fixtSODocument_02,
    fixtSODocument_NEW,
    fixtSOEquipment_01,
    fixtSODocument_01,
    fixtSOEquipmentFromAPI
} from './smart-objects';
import { fixtSysNotify, fixtSysNotifyUpdate } from './sys-objects';

export const fixtOperationsUpload: WorkflowOperationDto[] = [{
    type: 'action',
    saveOnApi: true,
    value: {
        actionKey: 'upload',
        value: {
            smartObject: fixtSODocument_02.uuid,
            file: '7b8cb8b3-9132-4da0-ba49-f1244994a443',
            fileName: 'test.png',
            fileType: 'image',
            info: {
                documentID: '58832ac9-572a-4a87-a4a8-a6d3eceabf23',
                versionID: '7b8cb8b3-9132-4da0-ba49-f1244994a443',
                reason: '',
                tags: '',
                userID: '110e8400-e29b-11d4-a716-446655440001',
            }
        }
    }
}];

export const fixReverseOperationUpload: WorkflowOperationDto[] = [{
    type: 'crud',
    saveOnApi: false,
    value: {
        op: 'patch',
        collection: 'smartobjects',
        key: fixtSODocument_02.uuid,
        value: [{
            op: 'replace',
            path: `/skills/atDocument`,
            value: {
                documents: []
            }
        }]
    }
}];

export const fixtOperationsNewDocument: WorkflowOperationDto[] = [{
    saveOnApi: false,
    type: 'crud',
    value: {
        op: 'add',
        collection: 'data',
        value: {
            key: 'document',
            value: fixtSODocument_NEW.uuid,
            type: 'so:document'
        }
    }
}, {
    type: 'crud',
    saveOnApi: true,
    value: {
        op: 'add',
        collection: 'smartobjects',
        value: fixtSODocument_NEW
    }
}, {
    saveOnApi: true,
    type: 'crud',
    value: {
        op: 'patch',
        collection: 'smartobjects',
        key: fixtSOEquipment_01.uuid,
        value: [{
            op: 'replace',
            path: `/properties/[key:DOCUMENTS]/value`,
            value: [
                fixtSODocument_01.uuid,
                fixtSODocument_02.uuid,
                fixtSODocument_NEW.uuid
            ]
        }]
    }
}];

export const fixtReverseNewDocument: WorkflowOperationDto[] = [{
    saveOnApi: true,
    type: 'crud',
    value: {
        op: 'patch',
        collection: 'smartobjects',
        key: fixtSOEquipment_01.uuid,
        value: [{
            op: 'replace',
            path: `/properties/[key:DOCUMENTS]/value`,
            value: [
                fixtSODocument_01.uuid,
                fixtSODocument_02.uuid
            ]
        }]
    }
}, {
    type: 'crud',
    saveOnApi: true,
    value: {
        op: 'remove',
        collection: 'smartobjects',
        key: fixtSODocument_NEW.uuid
    }
}, {
    saveOnApi: false,
    type: 'crud',
    value: {
        op: 'remove',
        collection: 'data',
        key: 'document'
    }
}];

export const fixtOperationsNotifyReviewer: WorkflowOperationDto[] = [{
    saveOnApi: false,
    type: 'crud',
    value: {
        op: 'add',
        collection: 'data',
        value: {
            key: 'notify',
            value: fixtSysNotify,
            type: 'sys:notification'
        }
    }
}];

export const fixtReverseNotifyReviewer: WorkflowOperationDto[] = [{
    saveOnApi: false,
    type: 'crud',
    value: {
        op: 'remove',
        collection: 'data',
        key: 'notify'
    }
}];

export const fixtOperationsNotifyEmitter: WorkflowOperationDto[] = [{
    saveOnApi: false,
    type: 'crud',
    value: {
        op: 'patch',
        collection: 'data',
        key: 'notify',
        value: [{
            op: 'replace',
            path: '/value',
            value: fixtSysNotifyUpdate
        }, {
            op: 'replace',
            path: '/type',
            value: 'sys:notification'
        }]
    }
}];

export const fixtReverseNotifyEmitter: WorkflowOperationDto[] = [{
    saveOnApi: false,
    type: 'crud',
    value: {
        op: 'patch',
        collection: 'data',
        key: 'notify',
        value: [{
            op: 'replace',
            path: '/value',
            value: fixtSysNotify
        }, {
            op: 'replace',
            path: '/type',
            value: 'sys:notification'
        }]
    }
}];

export const fixtFakeOperation: WorkflowOperationDto[] = [{
    type: 'crud',
    saveOnApi: true,
    value: {
        op: 'add',
        collection: 'smartobjects',
        value: fixtSOEquipmentFromAPI
    }
}];
