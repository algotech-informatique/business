import { ATSkillsDto, SmartObjectDto, SmartPropertyObjectDto } from '@algotech/core';
import moment from 'moment';

export const fixtSOEquipment_01: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4p',
    modelKey: 'EQUIPMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Equipment_01',
        },
        {
            key: 'DOCUMENTS',
            value: [
                'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4e',
                'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f',
            ],
        },
    ],
    skills: {},
};

export const fixtSODocument_01: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4e',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_01',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: null,
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_01_update: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4e',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_01_update',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: '',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_02: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_02',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: 'borrowed',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: ['a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z', '45f481fc-b9bc-48f4-8025-a79251d194d2']
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_03: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_03',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: 'borrowed',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_04: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_04',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: 'borrowed',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_05: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_05',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: 'borrowed',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_06: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4f',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_05',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: 'borrowed',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSODocument_NEW: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4y',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_NEW',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: '',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
    },
};

export const fixtSOEquipmentFromAPI: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4a',
    modelKey: 'EQUIPMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Equipment_01',
        },
        {
            key: 'DOCUMENTS',
            value: [
                ':-be2c-43c0-a378-8471242e62cf'
            ],
        },
    ],
    skills: {},
};

export const fixtSODocumentApi: SmartObjectDto = {
    uuid: ':-be2c-43c0-a378-8471242e62cf',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_01',
        },
        {
            key: 'VERSION',
            value: ['Version_01'],
        },
        {
            key: 'DATE',
            value: '2012-04-21T18:25:43-05:00',
        },
        {
            key: 'STATES',
            value: '',
        },
        {
            key: 'USER',
            value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: {
        atDocument: {
            documents: []
        }
    },
};

export const fixtSOUserApi: SmartObjectDto = {
    uuid: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
    modelKey: 'USER',
    properties: [
        {
            key: 'EMAIL',
            value: 'j.ford@mail.fr'
        },
        {
            key: 'FIRSTNAME',
            value: 'John'
        },
        {
            key: 'LASTNAME',
            value: 'Ford'
        },
        {
            key: 'LOGIN',
            value: 'jford'
        },
        {
            key: 'PASSWORD',
            value: '123456'
        },
        {
            key: 'CATEGORY',
            value: 'viewer'
        },
        {
            key: 'GROUPS',
            value: 'admin'
        },
    ],
    skills: {}
};

export const defaultSkills: ATSkillsDto = {
    atDocument: { documents: [] },
    atGeolocation: { geo: [] },
    atMagnet: { zones: [] },
    atSignature: null,
    atTag: { tags: [] },
}

export const fixtObjectUserToSo: SmartObjectDto = {
    uuid: '45f481fc-b9bc-48f4-8025-a79251d194d2',
    modelKey: 'USER',
    properties: [
        {
            key: 'EMAIL',
            value: 'j.ford@mail.fr'
        },
        {
            key: 'FIRSTNAME',
            value: 'John'
        },
        {
            key: 'LASTNAME',
            value: 'Ford'
        },
        {
            key: 'LOGIN',
            value: 'jford'
        },
        {
            key: 'PASSWORD',
            value: '123456'
        },
        {
            key: 'CATEGORY',
            value: 'viewer'
        },
        {
            key: 'GROUPS',
            value: ['sadmin']
        }
    ],
    skills: defaultSkills,
    local: false,
}

export const fixtSmartObjects: SmartObjectDto[] = [
    fixtSOEquipment_01,
    fixtSODocument_01,
    fixtSODocument_02,
    fixtSODocument_NEW,
    fixtSOUserApi,
    fixtObjectUserToSo,
];

export const fixtObjectDocumentToSo: SmartObjectDto = {
    uuid: 'f14ae602-308e-4a1b-8218-e027b7de9bfb',
    modelKey: 'DOCUMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Document_55',
        },
        {
            key: 'VERSION',
            value: [],
        },
        {
            key: 'DATE',
            value: moment('2020-11-17').format(),
        },
        {
            key: 'STATES',
            value: null,
        },
        {
            key: 'USER',
            value: '45f481fc-b9bc-48f4-8025-a79251d194d2',
        },
        {
            key: 'USERS',
            value: []
        }
    ],
    skills: defaultSkills,
    local: false,
}

export const    fixtObjectEquipmentToSo: SmartObjectDto = {
    uuid: '4f3c9a38-3386-494e-a610-af36170cd32f',
    modelKey: 'EQUIPMENT',
    properties: [
        {
            key: 'NAME',
            value: 'Equipment_55',
        },
        {
            key: 'DOCUMENTS',
            value: ['f14ae602-308e-4a1b-8218-e027b7de9bfb'],
        }
    ],
    skills: defaultSkills,
    local: false,
}

export const fixtObjectUser = {
    uuid: '45f481fc-b9bc-48f4-8025-a79251d194d2',
    EMAIL: 'j.ford@mail.fr',
    FIRSTNAME: 'John',
    LASTNAME: 'Ford',
    LOGIN: 'jford',
    PASSWORD: '123456',
    CATEGORY: 'viewer',
    GROUPS: ['sadmin']
}

export const fixtObjectDocument = {
    uuid: 'f14ae602-308e-4a1b-8218-e027b7de9bfb',
    NAME: 'Document_55',
    VERSION: [],
    DATE: '2020-11-17',
    TRUC: 'aaa',
    BIDULE: 'aaa',
    USER: fixtObjectUser,
    USERS: []
}

export const fixtObjectEquipment = {
    uuid: '4f3c9a38-3386-494e-a610-af36170cd32f',
    NAME: 'Equipment_55',
    DOCUMENTS: [fixtObjectDocument]
};

export const textMergeDocument_01: SmartPropertyObjectDto[] = [
    {
        key: 'NAME',
        value: 'Document_03'
    },
    {
        key: 'VERSION',
        value: ['Version_01', 'VERSION_0XX']
    },
    {
        key: 'DATE',
        value: '2012-04-21T18:25:43-05:00',
    },
    {
        key: 'STATES',
        value: 'borrowed',
    },
    {
        key: 'USER',
        value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
    }, {
        key: 'USERS',
        value: []
    }
];

export const textMergeDocument_02: SmartPropertyObjectDto[] = [
    {
        key: 'NAME',
        value: 'Document_04'
    },
    {
        key: 'VERSION',
        value: ['Version_01', 'VERSION_0XX']
    },
    {
        key: 'DATE',
        value: '2012-04-21T18:25:43-05:00',
    },
    {
        key: 'STATES',
        value: 'borrowed',
    },
    {
        key: 'USER',
        value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
    }, {
        key: 'USERS',
        value: []
    }
];

export const textMergeDocument_03: SmartPropertyObjectDto[] = [
    {
        key: 'NAME',
        value: 'Document_02X'
    },
    {
        key: 'VERSION',
        value: ['Version_01', 'VERSION_0XXA']
    },
    {
        key: 'DATE',
        value: '2012-04-21T18:25:43-05:00',
    },
    {
        key: 'STATES',
        value: 'created',
    },
    {
        key: 'USER',
        value: 'a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z',
    }, {
        key: 'USERS',
        value: []
    }
];
