import { SmartObjectDto, SysFile } from "@algotech/core";

export const smartObject: SmartObjectDto = {
  modelKey: 'toto',
  properties: [],
  skills: {
    atDocument: {
      documents: []
    }
  }
};

export const inputSmarObject1: SmartObjectDto = new SmartObjectDto()
inputSmarObject1.modelKey = 'toto';
inputSmarObject1.properties = [];
inputSmarObject1.skills = {
  atDocument: {
    documents: ['123456', '1234567', '12345678']
  }
};

export const inputSmarObject2: SmartObjectDto = new SmartObjectDto()
inputSmarObject2.modelKey = 'toto';
inputSmarObject2.properties = [];
inputSmarObject2.skills = {
  atDocument: {
    documents: ['12345', '123456', '12345678', '123459']
  }
};

export const sysfile1: SysFile = {
  documentID: '123456',
  versionID: '',
  name: '',
  ext: '',
  size: 12,
  dateUpdated: '',
  reason: '',
  user: '',
  tags: [],
  metadatas: []
};

export const sysfile2: SysFile = {
  documentID: '1234567',
  versionID: '',
  name: '',
  ext: '',
  size: 12,
  dateUpdated: '',
  reason: '',
  user: '',
  tags: [],
  metadatas: [],
};

export const sysfiles = [
  sysfile1,
  sysfile2,
  {
    documentID: undefined,
    versionID: '',
    name: '',
    ext: '',
    size: 12,
    dateUpdated: '',
    reason: '',
    user: '',
    tags: [],
    metadatas: [],
  },
  {
    documentID: null,
    versionID: '',
    name: '',
    ext: '',
    size: 12,
    dateUpdated: '',
    reason: '',
    user: '',
    tags: [],
    metadatas: [],
  },
  {
    versionID: '',
    name: '',
    ext: '',
    size: 12,
    dateUpdated: '',
    reason: '',
    user: '',
    tags: [],
    metadatas: [],
  }]

export const transition1 = {
  saveOnApi: true,
  type: 'action',
  value: {
    actionKey: 'linkCachedSysFile',
    value: {
      smartObject: 'toto',
      info: {
        versionID: '',
        reason: '',
        tags: '',
        userID: '',
        metadatas: []
      }
    }
  }
};

export const transition2 = {
  saveOnApi: true,
  type: 'action',
  value: {
    actionKey: 'linkCachedSysFile',
    value: {
      smartObject: 'toto',
      info: {
        versionID: '',
        reason: '',
        tags: '',
        userID: '',
        metadatas: []
      }
    }
  }
};
export const transition3 = {
  saveOnApi: true,
  type: 'action',
  value: {
    actionKey: 'linkCachedSysFile',
    value: {
      smartObject: 'toto',
      info: {
        versionID: '',
        reason: '',
        tags: '',
        userID: '',
        metadatas: []
      }
    }
  }
};