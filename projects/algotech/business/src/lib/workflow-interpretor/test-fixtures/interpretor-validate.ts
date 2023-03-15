import { fixtSOEquipmentFromAPI, fixtSODocument_02, fixtSODocument_NEW } from './smart-objects';
import { fixtSysNotifyUpdate } from './sys-objects';
import { InterpretorValidateDto } from '../../../../interpretor/src/dto';
import { SmartObjectDto } from '@algotech/core';

export const fixtValidateLoop: InterpretorValidateDto = {
    transitionKey: 'update',
    transfers: []
};

export const fixtValidateJumpRead: InterpretorValidateDto = {
    transitionKey: 'ok',
    transfers: []
};

export const fixtValidateFinished: InterpretorValidateDto = {
    transitionKey: 'notify',
    transfers: []
};

export const fixtValidateJumpChangeTransition: InterpretorValidateDto = {
    transitionKey: 'revision',
    transfers: []
};

export const fixtValidateJumpWrite: InterpretorValidateDto = {
    transitionKey: 'notify',
    transfers: [{
        saveOnApi: true,
        data: {
            key: 'notify',
            type: 'sys:notification'
        },
        type: 'sysobjects',
        value: fixtSysNotifyUpdate
    }]
};

export const fixtValidateSelectEquipment: InterpretorValidateDto = {
    transitionKey: 'select',
    transfers: [{
        saveOnApi: true,
        data: {
            key: 'equipment',
            type: 'so:equipment'
        },
        type: 'smartobjects',
        value: fixtSOEquipmentFromAPI
    }]
};

export const fixtValidateNewDocument: InterpretorValidateDto = {
    transitionKey: 'done',
    transfers: [{
        saveOnApi: true,
        data: {
            key: 'document',
            type: 'so:document'
        },
        type: 'smartobjects',
        value: fixtSODocument_NEW
    }]
};

export const fixtValidateObject = (saveOnApi: boolean, object: SmartObjectDto): InterpretorValidateDto => {
    return {
        transitionKey: 'done',
        transfers: [{
            saveOnApi,
            type: 'smartobjects',
            value: object
        }]
    };
};

export const fixtValidateUpload: InterpretorValidateDto = {
    transitionKey: 'done',
    transfers: [{
        saveOnApi: true,
        type: 'action',
        value: {
            actionKey: 'upload',
            asset: {
                file: new File([], 'test.txt', { type: 'text/plain' }),
                infoFile: {
                    versionID: '7b8cb8b3-9132-4da0-ba49-f1244994a443',
                    dateUpdated: '',
                    documentID: '',
                    ext: '',
                    name: '',
                    reason: '',
                    size: 0,
                    tags: [],
                    user: ''
                },
                private: true,
                saved: false,
            },
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
    }]
};

export const fixtValidateUpload02: InterpretorValidateDto = {
    transitionKey: 'done',
    transfers: [{
        saveOnApi: true,
        type: 'action',
        value: {
            actionKey: 'upload',
            asset: {
                file: new File([], 'test.txt', { type: 'text/plain' }),
                infoFile: {
                    versionID: '7b8cb8b3-9132-4da0-ba49-f1244994a444',
                    dateUpdated: '',
                    documentID: '',
                    ext: '',
                    name: '',
                    reason: '',
                    size: 0,
                    tags: [],
                    user: ''
                },
                private: true,
                saved: false
            },
            value: {
                smartObject: fixtSODocument_02.uuid,
                file: '7b8cb8b3-9132-4da0-ba49-f1244994a444',
                fileName: 'test.png',
                fileType: 'image',
                info: {
                    documentID: '58832ac9-572a-4a87-a4a8-a6d3eceabf24',
                    versionID: '7b8cb8b3-9132-4da0-ba49-f1244994a443',
                    reason: '',
                    tags: '',
                    userID: '110e8400-e29b-11d4-a716-446655440001',
                }
            }
        }
    }]
};
