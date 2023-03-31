import { WorkflowModelDto, ServiceModelDto } from '@algotech-ce/core';

export const fixtServiceEnd: ServiceModelDto = {
    uuid: '...',
    api: 'algotech',
    cache: false,
    execute: 'end',
    header: [],
    key: 'test',
    params: [],
    return: {
        multiple: false,
        type: 'so'
    },
    route: '',
    type: 'POST'
};

export const fixtWorkflowModelErrorNoEntryPoint: WorkflowModelDto = {
    tags: [],
    uuid: 'cfee7093-13ba-a88b-a0a2-24fe55c0a64z',
    key: 'error-no-entry-point',
    steps: [],
    description: [],
    displayName: [],
    iconName: '',
    profiles: [],
    variables: []
};

export const fixtWorkflowModelErrorManyEntryPoints: WorkflowModelDto = {
    tags: [],
    uuid: 'cfee7093-13ba-a88b-a0a2-24fe55c0a64z',
    key: 'error-no-entry-point',
    steps: [{
        uuid: 'cfee7093-13ba-a88b-a0a2-24fe55c0a64b',
        color: '',
        displayName: [],
        key: 'step',
        tasks: [{
            uuid: 'xfee7093-13ba-a88b-a0a2-24fe55c0a64b',
            key: 'task01',
            general: {
                displayName: [],
                iconName: '',
                profil: null,
            },
            position: {
                x: 0,
                y: 0
            },
            properties: {
                custom: null,
                services: [],
                transitions: []
            },
            type: 'TaskList',
        }, {
            uuid: 'yfee7093-13ba-a88b-a0a2-24fe55c0a64b',
            key: 'task02',
            general: {
                displayName: [],
                iconName: '',
                profil: null,
            },
            position: {
                x: 0,
                y: 0
            },
            properties: {
                custom: null,
                services: [],
                transitions: []
            },
            type: 'TaskList',
        }
        ]
    }],
    description: [],
    displayName: [],
    iconName: '',
    profiles: [],
    variables: []
};

export const fixtWorkflowModel1: WorkflowModelDto = {
    tags: [],
    uuid: 'cfee7093-13ba-a88b-a0a2-24fe55c0a647',
    key: 'create-document',
    displayName: [
        {
            lang: 'fr-FR',
            value: 'Créer un document',
        },
        {
            lang: 'en-US',
            value: 'Create a document',
        },
    ],
    description: [
        {
            lang: 'fr-FR',
            value: 'sur equipement géolocalisé',
        },
        {
            lang: 'en-US',
            value: 'on geolocalised equipment',
        },
    ],
    parameters: [{
        key: 'client id',
        value: 'external',
    }],
    iconName: 'fa-solid fa-map',
    variables: [],
    profiles: [
        {
            uuid: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
            name: 'Emitter',
            color: '#EB6317',
        },
        {
            uuid: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
            name: 'Reviewers',
            color: '#2D9CDB',
        },
    ],
    steps: [
        {
            displayName: [
                {
                    lang: 'fr-FR',
                    value: 'Proposition de document',
                },
                {
                    lang: 'en-US',
                    value: 'Document submission',
                },
            ],
            tasks: [
                {
                    uuid: '6b443bbe-1b2d-11e9-ab14-d663bd873d93',
                    key: 'equipement-selection',
                    type: 'TaskList',
                    position: {
                        x: 100,
                        y: 74.17024230957031,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Selection d un equipement',
                            },
                            {
                                lang: 'en-US',
                                value: 'Equipment selection',
                            },
                        ],
                        iconName: 'fa-solid fa-list',
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [
                            {
                                header: [],
                                params: [
                                    {
                                        key: 'modelKey',
                                        type: 'url-segment',
                                        value: 'EQUIPMENT',
                                    },
                                ],
                                uuid: '9af07f9f-5d30-4b4f-b677-ea867b3e93bc',
                                key: 'get-smart-objects-by-model',
                                type: 'GET',
                                cache: true,
                                execute: 'start',
                                api: 'algotech',
                                route: '{{SERVER}}/smart-objects/model/{{modelKey}}',
                                return: {
                                    multiple: true,
                                    type: 'so:equipment',
                                },
                            },
                        ],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'c04736fb-d958-de05-64d7-b732a37f4c9c',
                                        key: 'equipment',
                                        multiple: false,
                                        type: 'so:equipment',
                                        placeToSave: [],
                                    },
                                ],
                                uuid: 'd2275d14-9342-14a9-c9fb-50029e80e141',
                                key: 'select',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: 'e7d81563-6adb-a84a-4d1a-31295dd55205',
                            },
                        ],
                        custom: {
                            columnsDisplay: [
                                'NAME',
                            ],
                            multipleSelection: false,
                            items: ['{{get-smart-objects-by-model}}'],
                        },
                        expressions: [{
                            key: 'CURRENT_YEAR',
                            value: 'YEAR(NOW())',
                            type: 'number'
                        }
                        ],
                    },
                },
                {
                    uuid: '793461b8-1b2d-11e9-ab14-d663bd873d93',
                    key: 'document-upload',
                    type: 'TaskUpload',
                    position: {
                        x: 537.81201171875,
                        y: 53.712799072265625,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Upload d un document',
                            },
                            {
                                lang: 'en-US',
                                value: 'Document upload',
                            },
                        ],
                        iconName: 'fa-solid fa-file-arrow-up',
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'af50a7fb-71c1-f8bc-26c9-16de6b7db811',
                                        key: 'file',
                                        multiple: false,
                                        type: 'sys:file',
                                        placeToSave: [],
                                    },
                                ],
                                uuid: 'a2e6ab1e-bd87-f922-706a-b76816330019',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: '893287ba-1b2e-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {
                            multiple: false,
                            documents: '{{document}}',
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: '893287ba-1b2e-11e9-ab14-d663bd873d93',
                    key: 'document-form',
                    type: 'TaskForm',
                    position: {
                        x: 786.6240234375,
                        y: 109.47520446777344,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Formulaire de document',
                            },
                            {
                                lang: 'en-US',
                                value: 'Document form',
                            },
                        ],
                        iconName: 'fa-brands fa-wpforms',
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [],
                                uuid: '07bf96eb-50ed-496c-3284-9f50c8a883e0',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: 'd951a0be-1b2e-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {
                            columnsDisplay: [
                                'NAME',
                                'VERSION',
                                'DATE',
                                'STATES',
                                'USER',
                            ],
                            object: '{{document}}',
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: 'd951a0be-1b2e-11e9-ab14-d663bd873d93',
                    key: 'notify-reviewers',
                    type: 'TaskNotification',
                    position: {
                        x: 997.9733276367188,
                        y: 68.47520446777344,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Notification des reviewers',
                            },
                            {
                                lang: 'en-US',
                                value: 'Notify reviewers',
                            },
                        ],
                        iconName: 'fa-solid fa-bell',
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: '37dbc6a0-c82e-65b9-cba7-8b2b56e92a05',
                                        key: 'notify',
                                        multiple: false,
                                        type: 'sys:notification',
                                        placeToSave: [],
                                    },
                                ],
                                uuid: '075427d5-da78-1a1f-1f66-662bfe38187a',
                                key: 'notify',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: 'eb51f0d4-1b2e-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {
                            title: 'Creation of new document : {{file.name}} ',
                            content: 'Creator : {{file.user}} \nEquipment : {{equipment.NAME}} \nDate : ' +
                                '{{file.dateUpdated}} \nDocument : {{file.name}} ',
                            profiles: [
                                '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                            ],
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: 'e7d81563-6adb-a84a-4d1a-31295dd55205',
                    key: '',
                    type: 'TaskObjectCreate',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Nouveau Document',
                            },
                            {
                                lang: 'en-US',
                                value: 'New Document',
                            },
                            {
                                lang: 'es-ES',
                                value: '',
                            },
                        ],
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                        iconName: 'fa-solid fa-cube',
                    },
                    position: {
                        x: 338.5215759277344,
                        y: 104.5248031616211,
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'a68873d4-d42b-345d-fbe6-190ef980178c',
                                        key: 'document',
                                        multiple: false,
                                        type: 'so:document',
                                        placeToSave: ['{{equipment.DOCUMENTS}}'],
                                    },
                                ],
                                uuid: '7584f9b5-63f3-23f3-220c-4f8f5774a94c',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: '793461b8-1b2d-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {
                            smartModel: 'DOCUMENT',
                        },
                        expressions: [],
                    },
                },
            ],
            uuid: '66fc4312-1b2d-11e9-ab14-d663bd873d93',
            key: 'document-submission',
            color: '#C66E20',
        },
        {
            displayName: [
                {
                    lang: 'fr-FR',
                    value: 'Revue',
                },
                {
                    lang: 'en-US',
                    value: 'Review',
                },
            ],
            tasks: [
                {
                    uuid: 'eb51f0d4-1b2e-11e9-ab14-d663bd873d93',
                    key: 'reviewers-check',
                    type: 'TaskReview',
                    position: {
                        x: 900,
                        y: 300,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Verification du reviewer',
                            },
                            {
                                lang: 'en-US',
                                value: 'Reviewers Check',
                            },
                        ],
                        iconName: 'fa-solid fa-binoculars',
                        profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [
                                    {
                                        lang: 'fr-FR',
                                        value: 'Confirmer',
                                    },
                                    {
                                        lang: 'en-US',
                                        value: 'Confirm',
                                    },
                                    {
                                        lang: 'es-ES',
                                        value: '',
                                    },
                                ],
                                data: [],
                                uuid: '25e99d4a-1b30-11e9-ab14-d663bd873d93',
                                key: 'ok',
                                task: '2adafc78-1b2f-11e9-ab14-d663bd873d93',
                                position: {
                                    x: 62,
                                    y: 20,
                                },
                            },
                            {
                                displayName: [
                                    {
                                        lang: 'fr-FR',
                                        value: 'Refuser',
                                    },
                                    {
                                        lang: 'en-US',
                                        value: 'Refuse',
                                    },
                                    {
                                        lang: 'es-ES',
                                        value: '',
                                    },
                                ],
                                data: [],
                                uuid: '297252e0-1b30-11e9-ab14-d663bd873d93',
                                key: 'revision',
                                task: '3be361cc-1b2f-11e9-ab14-d663bd873d93',
                                position: {
                                    x: 62,
                                    y: 44,
                                },
                            },
                        ],
                        custom: {
                            comment: true,
                            notification: '{{notify}}',
                            linkedFiles: '{{file}}',
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: '2adafc78-1b2f-11e9-ab14-d663bd873d93',
                    key: 'notify-all',
                    type: 'TaskNotification',
                    position: {
                        x: 1100,
                        y: 300,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Notification à tous',
                            },
                            {
                                lang: 'en-US',
                                value: 'Notify all',
                            },
                        ],
                        iconName: 'fa-solid fa-bell',
                        profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'a6629986-1690-29f0-a611-5088306e1cd7',
                                        key: '',
                                        multiple: false,
                                        type: 'sys:notification',
                                        placeToSave: [],
                                    },
                                ],
                                uuid: '665ae374-4792-a35a-1dce-89d1fc54a48b',
                                key: 'notify',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: '2586ce28-b88f-639b-7d7f-ec72fd4b6501',
                            },
                        ],
                        custom: {
                            title: '(ACCEPT) document : {{file.name}}',
                            content: '{{notify.content}} ',
                            profiles: [
                                'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                                '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                            ],
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: '3be361cc-1b2f-11e9-ab14-d663bd873d93',
                    key: 'notify-emitter',
                    type: 'TaskNotification',
                    position: {
                        x: 1000,
                        y: 458,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Notification de l\'envoyeur',
                            },
                            {
                                lang: 'en-US',
                                value: 'Notify emitter',
                            },
                        ],
                        iconName: 'fa-solid fa-bell',
                        profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'e7056444-2141-9436-4d7c-1ca6cefd0d74',
                                        key: 'notify',
                                        multiple: false,
                                        type: 'sys:notification',
                                        placeToSave: [],
                                    },
                                ],
                                uuid: '502f1873-f9ef-edea-9931-3fbcd165f14c',
                                key: 'notify',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: '4b63f940-1b2f-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {
                            title: '(REVISION) document : {{file.name}}',
                            content: '{{notify.content}} ',
                            profiles: [
                                'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                            ],
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: '2586ce28-b88f-639b-7d7f-ec72fd4b6501',
                    key: '',
                    type: 'TaskFinisher',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: '',
                            },
                            {
                                lang: 'en-US',
                                value: '',
                            },
                            {
                                lang: 'es-ES',
                                value: '',
                            },
                        ],
                        profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                        iconName: 'fa-solid fa-flag-checkered',
                    },
                    properties: {
                        services: [],
                        transitions: [],
                        custom: {
                            save: true,
                            displayMode: 'nothing'
                        },
                        expressions: [],
                    },
                    position: {
                        x: 1277.234375,
                        y: 303,
                    },
                },
            ],
            uuid: 'f32fb3fe-1b2e-11e9-ab14-d663bd873d93',
            key: 'review',
            color: '#9B51E0',
        },
        {
            displayName: [
                {
                    lang: 'fr-FR',
                    value: 'Revision',
                },
                {
                    lang: 'en-US',
                    value: 'Révision',
                },
            ],
            tasks: [
                {
                    uuid: '4b63f940-1b2f-11e9-ab14-d663bd873d93',
                    key: 'revision-comments',
                    type: 'TaskReview',
                    position: {
                        x: 278,
                        y: 426,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Commentaire de la revision',
                            },
                            {
                                lang: 'en-US',
                                value: 'Revision comments',
                            },
                        ],
                        iconName: 'fa-solid fa-binoculars',
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [
                                    {
                                        lang: 'fr-FR',
                                        value: 'Mettre à jour',
                                    },
                                    {
                                        lang: 'en-US',
                                        value: 'Update',
                                    },
                                    {
                                        lang: 'es-ES',
                                        value: '',
                                    },
                                ],
                                data: [],
                                uuid: 'c69d5b7d-dada-9f99-5751-66ce249c3b52',
                                key: 'update',
                                position: {
                                    x: 62,
                                    y: 20,
                                },
                                task: '67eadb70-9f8a-3e56-bcd5-637dea197464',
                            },
                            {
                                displayName: [
                                    {
                                        lang: 'fr-FR',
                                        value: 'Annuler',
                                    },
                                    {
                                        lang: 'en-US',
                                        value: 'Discard',
                                    },
                                    {
                                        lang: 'es-ES',
                                        value: '',
                                    },
                                ],
                                data: [],
                                uuid: '7c815a69-279a-8388-2a97-46141e361024',
                                key: 'discard',
                                position: {
                                    x: 62,
                                    y: 44,
                                },
                                task: '6446c8b6-1b2f-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {
                            comment: false,
                            notification: '{{notify}}',
                            linkedFiles: '{{file}}',
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: '6446c8b6-1b2f-11e9-ab14-d663bd873d93',
                    key: 'notify-all',
                    type: 'TaskNotification',
                    position: {
                        x: 492,
                        y: 403,
                    },
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Notification à tous',
                            },
                            {
                                lang: 'en-US',
                                value: 'Notify all',
                            },
                        ],
                        iconName: 'fa-solid fa-bell',
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'a1b8c0dd-4d1b-8ecd-2233-c76b11cbb2d0',
                                        key: '',
                                        multiple: false,
                                        type: 'sys:notification',
                                        placeToSave: [],
                                    },
                                ],
                                uuid: 'de26aecc-6a7a-124b-bb94-67dfd436f821',
                                key: 'notify',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: '2d0c6e1c-b6a4-b6a2-78be-4dcf8097c20d',
                            },
                        ],
                        custom: {
                            title: '(DISCARD) document : {{file.name}}',
                            content: '{{notify.content}} ',
                            profiles: [
                                'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                                '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
                            ],
                        },
                        expressions: [],
                    },
                },
                {
                    uuid: '67eadb70-9f8a-3e56-bcd5-637dea197464',
                    key: '',
                    type: 'TaskUndo',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: '',
                            },
                            {
                                lang: 'en-US',
                                value: '',
                            },
                            {
                                lang: 'es-ES',
                                value: '',
                            },
                        ],
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                        iconName: 'fa-solid fa-rotate-left',
                    },
                    position: {
                        x: 390.234375,
                        y: 309,
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [],
                                uuid: '648853f5-2551-3856-e181-a13f73ec682d',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32,
                                },
                                task: '793461b8-1b2d-11e9-ab14-d663bd873d93',
                            },
                        ],
                        custom: {},
                        expressions: [],
                    },
                },
                {
                    uuid: '2d0c6e1c-b6a4-b6a2-78be-4dcf8097c20d',
                    key: '',
                    type: 'TaskFinisher',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: '',
                            },
                            {
                                lang: 'en-US',
                                value: '',
                            },
                            {
                                lang: 'es-ES',
                                value: '',
                            },
                        ],
                        profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
                        iconName: 'fa-solid fa-flag-checkered',
                    },
                    properties: {
                        services: [],
                        transitions: [],
                        custom: {
                            save: false,
                        },
                        expressions: [],
                    },
                    position: {
                        x: 658.234375,
                        y: 366,
                    },
                },
            ],
            uuid: '7486f6b4-1b12-11e9-ab14-d663bd873d93',
            key: 'revision',
            color: '#3CA4DC',
        },
    ],
};

export const fixtWorkflowModelStepBreadCrumb: WorkflowModelDto = {
    tags: [],
    key: 'stepbreadcrumb',
    displayName: [
        {
            lang: 'fr-FR',
            value: 'StepBreadCrumb'
        },
        {
            lang: 'en-US',
            value: ''
        },
        {
            lang: 'es-ES',
            value: ''
        }
    ],
    description: [
        {
            lang: 'fr-FR',
            value: ''
        },
        {
            lang: 'en-US',
            value: ''
        },
        {
            lang: 'es-ES',
            value: ''
        }
    ],
    profiles: [
        {
            uuid: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
            name: 'User',
            color: '#EB6317'
        }
    ],
    variables: [],
    steps: [
        {
            displayName: [
                {
                    lang: 'fr-FR',
                    value: 'Step01'
                },
                {
                    lang: 'en-US',
                    value: 'Step01'
                }
            ],
            tasks: [
                {
                    uuid: '601dfc62-d749-be7c-14f7-f6914b0f982e',
                    key: '',
                    type: 'TaskList',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: ''
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: ''
                            }
                        ],
                        profil: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
                        iconName: 'fa-solid fa-list'
                    },
                    position: {
                        x: 191,
                        y: 181
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: '62800691-52ef-1fe2-0bee-47f9e627cfc6',
                                        key: '',
                                        multiple: false,
                                        type: 'so:',
                                        placeToSave: [],
                                    }
                                ],
                                uuid: '6e62df9a-8a82-4dac-873b-88ba5dcb9ba6',
                                key: 'select',
                                position: {
                                    x: 64,
                                    y: 32
                                },
                                task: 'f0309170-663c-040c-0130-e96e2b90c271'
                            }
                        ],
                        expressions: [],
                        custom: {
                            columnsDisplay: [],
                            multipleSelection: false
                        }
                    }
                },
                {
                    uuid: 'f0309170-663c-040c-0130-e96e2b90c271',
                    key: '',
                    type: 'TaskUpload',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: ''
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: ''
                            }
                        ],
                        profil: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
                        iconName: 'fa-solid fa-file-arrow-up'
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: 'd6c55137-96d9-3c35-8a4f-fe4fdc11e4e5',
                                        key: '',
                                        multiple: false,
                                        type: 'so:',
                                        placeToSave: [],
                                    }
                                ],
                                uuid: 'bac34fb6-3779-aedf-b4a3-9555f68c6473',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32
                                },
                                task: '24c03b0e-7468-0fbc-ca03-0d4ff0753743'
                            }
                        ],
                        expressions: [],
                        custom: null
                    },
                    position: {
                        x: 355.234375,
                        y: 189
                    }
                },
                {
                    uuid: '24c03b0e-7468-0fbc-ca03-0d4ff0753743',
                    key: '',
                    type: 'TaskObjectCreate',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: ''
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: ''
                            }
                        ],
                        profil: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
                        iconName: 'fa-solid fa-cube'
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [],
                                uuid: 'd8e02f0a-e50f-0f07-99a5-365d899069ae',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32
                                },
                                task: '4b072630-f724-76a2-16ac-1b351c45dc47'
                            }
                        ],
                        expressions: [],
                        custom: null
                    },
                    position: {
                        x: 540.234375,
                        y: 189
                    }
                }
            ],
            uuid: 'db2a3332-fb8e-05a9-aed7-df11c3c80145',
            color: '#D50000',
            key: 'step01'
        },
        {
            displayName: [
                {
                    lang: 'fr-FR',
                    value: 'Step02'
                },
                {
                    lang: 'en-US',
                    value: 'Step02'
                }
            ],
            tasks: [
                {
                    uuid: '4b072630-f724-76a2-16ac-1b351c45dc47',
                    key: '',
                    type: 'TaskObjectCreate',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: ''
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: ''
                            }
                        ],
                        profil: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
                        iconName: 'fa-solid fa-cube'
                    },
                    position: {
                        x: 777,
                        y: 132
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: '1978e4a6-dcb8-bb65-73cc-1a2a76de8865',
                                        key: '',
                                        multiple: false,
                                        type: 'so:',
                                        placeToSave: [],
                                    }
                                ],
                                uuid: '6471be29-4a64-2347-dd47-71e5360b519e',
                                key: 'select',
                                position: {
                                    x: 64,
                                    y: 32
                                },
                                task: '3fa348da-d81c-5999-5983-76cac3b1db70'
                            }
                        ],
                        expressions: [],
                        custom: {
                            columnsDisplay: [],
                            multipleSelection: false
                        }
                    }
                },
                {
                    uuid: '3fa348da-d81c-5999-5983-76cac3b1db70',
                    key: '',
                    type: 'TaskList',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: ''
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: ''
                            }
                        ],
                        profil: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
                        iconName: 'fa-solid fa-list'
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [
                                    {
                                        uuid: '3c933435-7774-a818-92f9-ecdfc00444f1',
                                        key: '',
                                        multiple: false,
                                        type: 'so:',
                                        placeToSave: [],
                                    }
                                ],
                                uuid: '861e0c0f-6549-2b8b-7702-3e9f3f977af5',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32
                                },
                                task: 'bf0be16f-8849-b9c7-44bc-a03359153c2a'
                            }
                        ],
                        expressions: [],
                        custom: null
                    },
                    position: {
                        x: 930.234375,
                        y: 224
                    }
                },
                {
                    uuid: 'bf0be16f-8849-b9c7-44bc-a03359153c2a',
                    key: '',
                    type: 'TaskUpload',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: ''
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: ''
                            }
                        ],
                        profil: '8a1f43bf-9175-8eb1-e57a-db0735f6ed15',
                        iconName: 'fa-solid fa-file-arrow-up'
                    },
                    properties: {
                        services: [],
                        transitions: [
                            {
                                displayName: [],
                                data: [],
                                uuid: 'd5cac613-fdfb-87a1-2feb-89110ceaecb0',
                                key: 'done',
                                position: {
                                    x: 64,
                                    y: 32
                                },
                                task: null
                            }
                        ],
                        expressions: [],
                        custom: null
                    },
                    position: {
                        x: 1101.234375,
                        y: 261
                    }
                }
            ],
            uuid: 'b3898b0c-561e-9cf3-a3bd-883727b84d4d',
            color: '#1E88E5',
            key: 'step02'
        }
    ],
    uuid: '98e3dbfb-0a87-4ac1-b9a0-803334104124'
};

export const fixtSmartflowService: WorkflowModelDto = {
    uuid: 'c00fdeef-f2f5-4165-7e82-0d96dd90e169',
    createdDate: '2022-05-09T07:47:19.093Z',
    updateDate: '2022-06-14T06:11:52+02:00',
    viewId: '7d758c94-cfea-7378-fff4-1db735af66eb',
    snModelUuid: 'c00fdeef-f2f5-4165-7e82-0d96dd90e169',
    viewVersion: 4,
    key: 'sf-a-1',
    displayName: [
        {
            lang: 'fr-FR',
            value: 'DynamicStatus'
        },
        {
            lang: 'en-US',
            value: ''
        },
        {
            lang: 'es-ES',
            value: ''
        }
    ],
    parameters: [],
    variables: [
        {
            uuid: 'c199b17f-be3b-2e32-e447-f8c31e660b7e',
            key: 'error',
            type: 'number',
            multiple: false
        }
    ],
    profiles: [],
    tags: [],
    steps: [
        {
            uuid: 'cf48f406-8070-eb8d-7a06-3e1a4cc2e5e4',
            displayName: [
                {
                    lang: 'fr-FR',
                    value: ''
                },
                {
                    lang: 'en-US',
                    value: ''
                },
                {
                    lang: 'es-ES',
                    value: ''
                }
            ],
            key: 'unknown',
            tasks: [
                {
                    uuid: '1b4844a4-61e9-1458-ad17-51b8aadbffa6',
                    key: 'depart',
                    type: 'TaskLauncher',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'DÉPART'
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: 'COMIENZO'
                            }
                        ],
                        iconName: 'fa-solid fa-chart-line'
                    },
                    properties: {
                        transitions: [
                            {
                                uuid: '64ed0164-810d-6d86-20de-053121a71b9d',
                                key: 'done',
                                task: 'dfde51b2-d5d4-9559-8f89-1984068d03f5',
                                data: []
                            }
                        ],
                        custom: {},
                        expressions: [],
                        services: []
                    }
                },
                {
                    uuid: 'dfde51b2-d5d4-9559-8f89-1984068d03f5',
                    key: 'service',
                    type: 'TaskService',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Service'
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: 'Servicio'
                            }
                        ],
                        iconName: 'fa-solid fa-square-caret-up'
                    },
                    properties: {
                        transitions: [
                            {
                                uuid: 'ed2b3967-564b-beb1-4c8e-aed19296d4a1',
                                key: 'done',
                                displayName: [
                                    {
                                        lang: 'fr-FR',
                                        value: 'Succès'
                                    },
                                    {
                                        lang: 'en-US',
                                        value: ''
                                    },
                                    {
                                        lang: 'es-ES',
                                        value: 'Fin correcto'
                                    }
                                ],
                                task: 'fef57afd-7d88-214b-3b49-f610a7e6b5ed',
                                data: [
                                    {
                                        uuid: 'bee44bf1-6a14-272f-fb27-7cabf614c25e',
                                        key: 'service_done__1',
                                        multiple: false,
                                        type: 'object',
                                        placeToSave: []
                                    }
                                ]
                            },
                            {
                                uuid: '880234f0-a963-97b2-c0f7-95accdc66c6c',
                                key: 'error',
                                displayName: [
                                    {
                                        lang: 'fr-FR',
                                        value: 'Erreur'
                                    },
                                    {
                                        lang: 'en-US',
                                        value: ''
                                    },
                                    {
                                        lang: 'es-ES',
                                        value: 'Error'
                                    }
                                ],
                                task: 'f1862a53-0b39-cb37-ab87-d8caa75d1b68',
                                data: [
                                    {
                                        uuid: 'd5f2c3f3-3384-a05e-bd21-d63ddab1c698',
                                        key: 'service_error__2',
                                        multiple: false,
                                        type: 'number',
                                        placeToSave: []
                                    },
                                    {
                                        uuid: '4fd561aa-8386-e572-8813-bdbe250430a4',
                                        key: 'service_error__3',
                                        multiple: false,
                                        type: 'string',
                                        placeToSave: []
                                    }
                                ]
                            }
                        ],
                        custom: {
                            type: 'get',
                            responseType: 'text',
                            url: 'http://',
                            listSysFile: [],
                            fileName: '',
                            generate: false,
                            object: null,
                            version: null,
                            headers: [],
                            parameters: [],
                            body: []
                        },
                        expressions: [],
                        services: []
                    }
                },
                {
                    uuid: 'f1862a53-0b39-cb37-ab87-d8caa75d1b68',
                    key: 'resultat-du-smartflow',
                    type: 'TaskRequestResult',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Résultat du smartflow'
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: 'Resultado smartflow'
                            }
                        ],
                        iconName: 'fa-solid fa-keyboard'
                    },
                    properties: {
                        transitions: [
                            {
                                uuid: '3080954f-78e9-9a3d-6a1b-3a4148f42b49',
                                key: 'done',
                                task: '6249d6a4-8114-963c-d3f3-5541446ab1fb',
                                data: [
                                    {
                                        uuid: '2b60dec2-7145-f5d4-3b3a-af64d43e7ce1',
                                        key: 'resultat-du-smartflow_done_result_4',
                                        multiple: false,
                                        type: 'json',
                                        placeToSave: []
                                    },
                                    {
                                        uuid: 'c9cc7a63-83ba-1fcf-af92-3283f83f873e',
                                        key: 'resultat-du-smartflow_done_status_5',
                                        multiple: false,
                                        type: 'number',
                                        placeToSave: []
                                    }
                                ]
                            }
                        ],
                        custom: {
                            inputs: {
                                error: 'an error occured'
                            },
                            code: 400,
                            format: null
                        },
                        expressions: [],
                        services: []
                    }
                },
                {
                    uuid: '6249d6a4-8114-963c-d3f3-5541446ab1fb',
                    key: 'fin',
                    type: 'TaskFinisher',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'FIN'
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: 'FIN'
                            }
                        ],
                        iconName: 'fa-solid fa-flag-checkered'
                    },
                    properties: {
                        transitions: [],
                        custom: {
                            save: false
                        },
                        expressions: [],
                        services: []
                    }
                },
                {
                    uuid: 'fef57afd-7d88-214b-3b49-f610a7e6b5ed',
                    key: 'resultat-du-smartflow',
                    type: 'TaskRequestResult',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'Résultat du smartflow'
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: 'Resultado smartflow'
                            }
                        ],
                        iconName: 'fa-solid fa-keyboard'
                    },
                    properties: {
                        transitions: [
                            {
                                uuid: 'ab7860b8-5acf-5401-4058-07b40c443bb4',
                                key: 'done',
                                task: '646bff62-00b4-be3a-66bf-f20ee0aa11a1',
                                data: [
                                    {
                                        uuid: 'c37a242d-78d8-3dfb-3aa5-d9664c8c8f1d',
                                        key: 'resultat-du-smartflow_done_result_6',
                                        multiple: false,
                                        type: 'json',
                                        placeToSave: []
                                    },
                                    {
                                        uuid: '8a2e460a-37ab-d5e3-ab58-5ec377d183b1',
                                        key: 'resultat-du-smartflow_done_status_7',
                                        multiple: false,
                                        type: 'number',
                                        placeToSave: []
                                    }
                                ]
                            }
                        ],
                        custom: {
                            inputs: {
                                success: true
                            },
                            code: 200,
                            format: null
                        },
                        expressions: [],
                        services: []
                    }
                },
                {
                    uuid: '646bff62-00b4-be3a-66bf-f20ee0aa11a1',
                    key: 'fin',
                    type: 'TaskFinisher',
                    general: {
                        displayName: [
                            {
                                lang: 'fr-FR',
                                value: 'FIN'
                            },
                            {
                                lang: 'en-US',
                                value: ''
                            },
                            {
                                lang: 'es-ES',
                                value: 'FIN'
                            }
                        ],
                        iconName: 'fa-solid fa-flag-checkered'
                    },
                    properties: {
                        transitions: [],
                        custom: {
                            save: false
                        },
                        expressions: [],
                        services: []
                    }
                }
            ]
        }
    ],
    api: {
        route: 'DynamicStatus',
        type: 'POST',
        auth: {
            jwt: true
        },
        summary: '',
        description: '',
        result: []
    }
};