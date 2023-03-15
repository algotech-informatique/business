import { WorkflowDataDto } from '@algotech/core';
import { fixtSysNotify } from './sys-objects';

export const fixtDataWorkflow: WorkflowDataDto[] = [
    {
        key: 'equipment',
        value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4p',
        type: 'so:equipment'
    },
    {
        key: 'document',
        value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4y',
        type: 'so:document'
    },
    {
        key: 'notify',
        value: fixtSysNotify,
        type: 'sys:notification'
    }, {
        key: 'documents',
        value: [
            'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4e',
            'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f'
        ],
        type: 'so:document'
    }, {
        key: 'empty',
        value: [
        ],
        type: 'so:document'
    }, {
        key: 'object',
        value: {
            test: 'toto'
        },
        type: 'object'
    }
];
