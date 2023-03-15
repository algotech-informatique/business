import { ServiceModelDto } from '@algotech/core';

export const fixtWorkflowServiceConnector: ServiceModelDto = {
    uuid: '59eb089d-f88c-12f6-77a4-e125736653ca',
    key: '59eb089d-f88c-12f6-77a4-e125736653ca',
    type: 'POST',
    cache: true,
    execute: 'start',
    api: 'algotech',
    route: '{{SERVER}}/smartflows/startsmartflows',
    header: [],
    params: [
        {
            key: 'key',
            value: 'paul-create-machine',
            type: 'request-body'
        },
        {
            key: 'inputs',
            value: [],
            type: 'request-body'
        }
    ],
    mappedParams: [],
    body: null,
    return: {
        type: 'string',
        multiple: true
    }
};

export const fixtWorkflowDeprecatedServiceSearch: ServiceModelDto = {
    uuid: 'a99c13c0-6420-3f54-f773-731375270a05',
    key: 'a99c13c0-6420-3f54-f773-731375270a05',
    type: 'POST',
    cache: true,
    execute: 'start',
    api: 'algotech',
    route: '{{SERVER}}/smart-objects/search/{{modelKey}}?property={{filterProperty}}&value={{filterValue}}&defaultOrder={{orderProperty}}&order={{orderDirection}}&skip={{skip}}&limit={{limit}}',
    header: [],
    params: [
        {
            key: 'modelKey',
            type: 'url-segment',
            value: ''
        }, {
            key: 'filterProperty',
            type: 'url-segment',
            value: ''
        }, {
            key: 'filterValue',
            type: 'url-segment',
            value: ''
        }, {
            key: 'orderProperty',
            type: 'url-segment',
            value: ''
        }, {
            key: 'orderDirection',
            type: 'url-segment',
            value: ''
        }, {
            key: 'skip',
            type: 'url-segment',
            value: ''
        }, {
            key: 'limit',
            type: 'url-segment',
            value: ''
        }
    ],
    mappedParams: [
        {
            key: 'skip',
            value: 'skip'
        }, {
            key: 'limit',
            value: 'limit'
        }, {
            key: 'search',
            value: 'value'
        }
    ],
    body: null,
    return: {
        type: 'so:machine',
        multiple: true
    }
};

export const fixtWorkflowServiceSearch: ServiceModelDto = {
    uuid: 'a99c13c0-6420-3f54-f773-731375270a05',
    key: 'a99c13c0-6420-3f54-f773-731375270a05',
    type: 'POST',
    cache: true,
    execute: 'start',
    api: 'algotech',
    route: '{{SERVER}}/search/smart-objects?search={{search}}&skip={{skip}}&limit={{limit}}',
    header: [],
    params: [
        {
            key: 'modelKey',
            value: 'machine',
            type: 'request-body'
        },
        {
            key: 'filter',
            value: [],
            type: 'request-body'
        },
        {
            key: 'order',
            value: [],
            type: 'request-body'
        },
        {
            key: 'skip',
            value: '',
            type: 'url-segment'
        },
        {
            key: 'limit',
            value: '',
            type: 'url-segment'
        },
        {
            key: 'search',
            value: '',
            type: 'url-segment'
        }
    ],
    mappedParams: [
        {
            key: 'skip',
            value: 'skip'
        },
        {
            key: 'limit',
            value: 'limit'
        },
        {
            key: 'search',
            value: 'search'
        }
    ],
    body: null,
    return: {
        type: 'so:machine',
        multiple: true
    }
};