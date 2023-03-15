
import * as _ from 'lodash';
import {
    SmartObjectDto, WorkflowOperationDto, WorkflowDataDto,
    SmartModelDto, TaskTransitionModelDto, PatchPropertyDto, SmartPropertyObjectDto, CrudDto, WorkflowTaskActionDto, DocumentDto,
    PatchService
} from '@algotech/core';
import { InterpretorAction, ActionResult } from './interpretor-action';
import { InterpretorTransferTransitionDto } from '../../dto';
import { WorkflowErrorPlaceToSaved, WorkflowErrorSmartObjectNotFind } from '../../error/interpretor-error';
import { InterpretorTaskActionAssetDto } from '../../dto';
import { InterpretorSoUtils } from '../interpretor-so/interpretor-so-utils';

export class InterpretorOperations {

    private _operations: WorkflowOperationDto[];
    private _reverses: WorkflowOperationDto[];
    private _smartobjects: SmartObjectDto[];
    private _documents: DocumentDto[];
    private _datas: WorkflowDataDto[];
    private _assets: any[];
    private _indexes: Object;

    get operations() {
        return this._operations;
    }

    get reverses() {
        return this._reverses;
    }

    get assets() {
        return this._assets;
    }

    constructor(datas: WorkflowDataDto[], smartobjects: SmartObjectDto[], documents: DocumentDto[], indexes: Object) {
        this._operations = [];
        this._assets = [];
        this._reverses = [];
        this._datas = datas;
        this._smartobjects = smartobjects;
        this._documents = documents;
        this._indexes = indexes;
    }

    public createOperation(transfer: InterpretorTransferTransitionDto, transition?: TaskTransitionModelDto) {
        switch (transfer.type) {
            case 'action': {
                this._createOperationsAction(transfer);
            }
                break;
            case 'sysobjects': {
                // data
                this._createOperationsData(transfer);
            }
                break;
            case 'smartobjects': {
                // data
                this._createOperationsData(transfer);

                if (!transfer.ignoreOperations) {
                    const smartObjects: SmartObjectDto[] = <SmartObjectDto[]>(_.isArray(transfer.value) ?
                        transfer.value : [transfer.value]);

                    // so
                    _.forEach(smartObjects, (smartObject) => {
                        this._createOperationsSmartObjects(transfer.saveOnApi, smartObject);
                    });
                }

                // place to save
                if (transition && transfer.data) {
                    const data = transition.data.find((d) => d.key === transfer.data.key);
                    if (data && data.placeToSave && _.isArray(data.placeToSave)) {
                        _.forEach(data.placeToSave, (placeToSave) => {
                            this._createOperationsSaved(<SmartObjectDto | SmartObjectDto[]>transfer.value, placeToSave);
                        });
                    }
                }
            }
                break;
        }
    }

    public executeOperation(operation: WorkflowOperationDto): WorkflowDataDto[] {
        const data: WorkflowDataDto[] = [];
        if (operation.type === 'crud') {
            const crudOp: CrudDto = (operation.value as CrudDto);

            switch (crudOp.op) {
                case 'add':
                    switch (crudOp.collection) {
                        case 'smartobjects':
                            // rm local so
                            const iSmartobject = this._smartobjects.findIndex((so) => so.uuid === crudOp.value?.uuid && so.local);
                            if (iSmartobject > -1) {
                                InterpretorSoUtils.removeSo(this._smartobjects, this._indexes, crudOp.value?.uuid);
                            }
                            InterpretorSoUtils.pushSo(this._smartobjects, this._indexes, crudOp.value);
                            break;
                        case 'data':
                            this._datas.push(crudOp.value);
                            data.push(crudOp.value);
                            break;
                        case 'documents':
                            this._documents.push(crudOp.value);
                            break;
                    }
                    break;
                case 'remove':
                    switch (crudOp.collection) {
                        case 'smartobjects':
                            InterpretorSoUtils.removeSo(this._smartobjects, this._indexes, crudOp.key);
                            break;
                        case 'data':
                            this._datas.splice(this._datas.findIndex((d) => d.key === crudOp.key), 1);
                            break;
                        case 'documents':
                            this._documents.splice(this._documents.findIndex((d) => d.uuid === crudOp.key), 1);
                            break;
                    }
                    break;
                case 'patch':
                    const patchOp: PatchPropertyDto[] = crudOp.value as PatchPropertyDto[];
                    switch (crudOp.collection) {
                        case 'smartobjects': {
                            const iSmartobject = this._smartobjects.findIndex((so) => so.uuid === crudOp.key);

                            this._smartobjects[iSmartobject] = InterpretorSoUtils.smartObjectToClass(
                                new PatchService<SmartObjectDto>().recompose(patchOp,
                                    this._smartobjects[iSmartobject])
                            );

                            break;
                        }
                        case 'data': {
                            const iData = this._datas.findIndex((data) => data.key === crudOp.key);

                            this._datas[iData].value = patchOp[0].value;
                            this._datas[iData].type = patchOp[1].value;

                            data.push(this._datas[iData]);

                            break;
                        }
                        case 'documents': {
                            const iDocuments = this._documents.findIndex((doc) => doc.uuid === crudOp.key);

                            this._documents[iDocuments] = new PatchService<DocumentDto>().recompose(patchOp,
                                this._documents[iDocuments]);

                            break;
                        }
                    }
            }
        } else {
            this._executeAction(operation);
        }
        return data;
    }

    public free() {
        this._operations = null;
        this._reverses = null;
        this._smartobjects = null;
        this._datas = null;
        this._assets = null;
    }

    /** public for test */
    _createOperationsAction(transfer: InterpretorTransferTransitionDto) {
        const action: InterpretorTaskActionAssetDto = _.cloneDeep(transfer.value as InterpretorTaskActionAssetDto);

        if (action.asset) {
            this.assets.push(action.asset);
            delete action.asset;
        }

        const operation: WorkflowOperationDto = {
            saveOnApi: transfer.saveOnApi,
            type: 'action',
            value: {
                actionKey: action.actionKey,
                value: action.value
            }
        };

        if (transfer.requireInstance) {
            operation.requireInstance = transfer.requireInstance;
        }

        this._operations.push(operation);

        const reverseAction = this._reverseAction(operation.value as WorkflowTaskActionDto);
        if (reverseAction) {
            this._reverses.unshift(reverseAction);
        }
    }

    /** public for test */
    _createOperationsData(transfer: InterpretorTransferTransitionDto) {
        // data
        if (transfer.data) {
            const findData = this._datas.find((d) => d.key === transfer.data.key);

            const arrayValue = _.isArray(transfer.value) ? transfer.value : [transfer.value];
            const smartObjects: SmartObjectDto[] = transfer.type === 'smartobjects' ? <SmartObjectDto[]>arrayValue : [];

            let value = transfer.value;
            if (transfer.type === 'smartobjects') {
                value = _.isArray(transfer.value) ? _.map(smartObjects, (so: SmartObjectDto) => so.uuid) : smartObjects[0].uuid;
            }

            if (!findData) {
                const type = smartObjects.length !== 0 ? `so:${smartObjects[0].modelKey.toLowerCase()}` : transfer.data.type;
                this._operations.push(this._addData(transfer.data.key, value, type));
                this._reverses.unshift(this._removeData(transfer.data.key));
            } else {
                // patch
                const patch = this._patchData(transfer.data.key, transfer.data.type, value);
                if (patch) {
                    this._operations.push(patch);
                    this._reverses.unshift(this._patchData(transfer.data.key, findData.type, findData.value));
                }
            }
        }
    }

    /** public for test */
    _createOperationsSmartObjects(saveOnApi: boolean, smartObject: SmartObjectDto) {
        if (saveOnApi) {
            delete smartObject.local;
        }

        let findSo = this._smartobjects.length === 0 ? null :
            InterpretorSoUtils.quickFind(this._smartobjects, this._indexes, smartObject.uuid);

        // saveOnApi => return so which is not local
        if (saveOnApi) {
            if (findSo?.local) {
                findSo = null;
            }
        }
        if (!findSo) {
            // add
            this._operations.push(this._addSmartObject(saveOnApi, smartObject));
            this._reverses.unshift(this._removeSmartObject(saveOnApi, smartObject.uuid));
        } else {
            // patch
            const patch = this._patchSmartObjectWithDifference(saveOnApi, findSo, smartObject);
            if (patch) {
                this._operations.push(patch);
                const reversePatch = this._patchSmartObjectWithDifference(saveOnApi, smartObject, findSo);
                if (reversePatch) {
                    this._reverses.unshift(reversePatch);
                }
            }
        }
    }

    /** public for test */
    _findData(key: string): WorkflowDataDto {
        const data = this._datas.find((d) => d.key === key);
        if (!data) {
            throw new WorkflowErrorPlaceToSaved('ERR-132', `{{DATA}} : ${key} {{NOT-FOUND}}`);
        }
        return data;
    }

    /** public for test */
    _findSo(uuid: string): SmartObjectDto {
        const smartobject = InterpretorSoUtils.quickFind(this._smartobjects, this._indexes, uuid);
        if (!smartobject) {
            throw new WorkflowErrorPlaceToSaved('ERR-133', `{{SMARTOBJECT}} : ${uuid} {{NOT-FOUND}}`);
        }
        return smartobject;
    }

    /** public for test */
    _findProperty(smartobject: SmartObjectDto, key: string): SmartPropertyObjectDto {
        const property = smartobject.properties.find((p) => p.key === key);
        if (!property) {
            throw new WorkflowErrorPlaceToSaved('ERR-134', `{{PROPERTY}} : ${key} {{NOT-FOUND}} {{SMARTOBJECT}} ${smartobject.uuid}`);
        }
        return property;
    }

    /** public for test */
    _createOperationsSaved(value: SmartObjectDto | SmartObjectDto[], placeToSave: string) {

        const expression = placeToSave.slice(2, placeToSave.length - 2);
        const split = expression.split('.');
        if (split.length <= 1) {
            throw new WorkflowErrorPlaceToSaved('ERR-135', `{{INCORRECT}} : ${placeToSave}`);
        }

        const data = this._findData(split[0]);
        let smartobject = this._findSo(data.value);
        split.shift();

        while (split.length > 1) {
            smartobject = this._findSo(this._findProperty(smartobject, split[0]).value);
            split.shift();
        }

        const valueBefore = this._findProperty(smartobject, split[0]).value;
        let valueAfter = _.cloneDeep(valueBefore);

        const uuid = Array.isArray(value) ? _.map(value, (so) => so.uuid) : [value.uuid];
        if (_.isArray(valueBefore)) {
            valueAfter.push(...uuid);
        } else {
            if (uuid.length !== 1) {
                throw new WorkflowErrorPlaceToSaved('ERR-136', `${placeToSave} {{NEEDS-OBJECT-RECEIVED-ARRAY}}`);
            }
            valueAfter = uuid[0];
        }

        this._operations.push(this._patchSmartObjectWithPatches(true, smartobject.uuid, [{
            op: 'replace',
            path: `/properties/[key:${split[0]}]/value`,
            value: valueAfter
        }]));

        this._reverses.unshift(this._patchSmartObjectWithPatches(true, smartobject.uuid, [{
            op: 'replace',
            path: `/properties/[key:${split[0]}]/value`,
            value: valueBefore
        }]));
    }

    /** public for test */
    _executeAction(operation: WorkflowOperationDto) {
        // action
        const actionService = new InterpretorAction(this._smartobjects, this._documents);
        const result: ActionResult = actionService.executeAction(operation.value as WorkflowTaskActionDto);
        if (result) {
            if (result.smartObject) {
                const index = _.findIndex(this._smartobjects, (so) => so.uuid === result.smartObject.uuid);
                if (index > -1) {
                    this._smartobjects[index] = result.smartObject;
                } else {
                    this._smartobjects.push(result.smartObject);
                }
            }
            if (result.document) {
                const index = _.findIndex(this._documents, (doc) => doc.uuid === result.document.uuid);
                if (index > -1) {
                    this._documents[index] = result.document;
                } else {
                    this._documents.push(result.document);
                }
            }
        }
    }

    /** public for test */
    _reverseAction(action: WorkflowTaskActionDto): WorkflowOperationDto {
        const actionService = new InterpretorAction(this._smartobjects, this._documents);
        const result: ActionResult = actionService.executeAction(action);
        if (result) {
            if (result.smartObject) {
                const index = _.findIndex(this._smartobjects, (so) => so.uuid === result.smartObject.uuid);
                if (index > -1) {
                    return this._patchSmartObjectWithDifference(false, result.smartObject, this._smartobjects[index]);
                } else {
                    return this._removeSmartObject(false, result.smartObject.uuid);
                }
            }
            if (result.document) {
                const index = _.findIndex(this._documents, (doc) => doc.uuid === result.document.uuid);
                if (index > -1) {
                    return this._patchDocumentWithDifference(false, result.document, this._documents[index]);
                } else {
                    return this._removeDocument(false, result.document.uuid);
                }
            }
        }
        return null;
    }

    /** public for test */
    _addData(key: string, value: any, type: string): WorkflowOperationDto {
        return {
            saveOnApi: false,
            type: 'crud',
            value: {
                op: 'add',
                collection: 'data',
                value: {
                    key,
                    value,
                    type
                }
            }
        };
    }

    /** public for test */
    _removeData(key: string): WorkflowOperationDto {
        return {
            saveOnApi: false,
            type: 'crud',
            value: {
                op: 'remove',
                collection: 'data',
                key
            }
        };
    }

    /** public for test */
    _addSmartObject(saveOnApi: boolean, value: SmartObjectDto): WorkflowOperationDto {
        return {
            saveOnApi,
            type: 'crud',
            value: {
                op: 'add',
                collection: 'smartobjects',
                value
            }
        };
    }

    /** public for test */
    _removeSmartObject(saveOnApi: boolean, key: string): WorkflowOperationDto {
        return {
            saveOnApi,
            type: 'crud',
            value: {
                op: 'remove',
                collection: 'smartobjects',
                key
            }
        };
    }

    /** public for test */
    _removeDocument(saveOnApi: boolean, key: string): WorkflowOperationDto {
        return {
            saveOnApi,
            type: 'crud',
            value: {
                op: 'remove',
                collection: 'documents',
                key
            }
        };
    }

    /** public for test */
    _patchData(key: string, type: string, data: any): WorkflowOperationDto {
        const patches: PatchPropertyDto[] = [{
            op: 'replace',
            path: '/value',
            value: data
        }, {
            op: 'replace',
            path: '/type',
            value: type
        }];

        return {
            saveOnApi: false,
            type: 'crud',
            value: {
                op: 'patch',
                key,
                collection: 'data',
                value: patches
            }
        };
    }

    /** public for test */
    _patchSmartObjectWithDifference(saveOnApi: boolean, soBefore: SmartObjectDto, soAfter: SmartObjectDto): WorkflowOperationDto {
        const patches: PatchPropertyDto[] = [];

        // properties
        patches.push(..._.compact(soAfter.properties.map((prop) => {
            const compareProp = soBefore.properties.find((p) => p.key === prop.key);
            if (!compareProp) {
                return { op: 'add', path: `/properties/[?]`, value: _.cloneDeep(prop) };
            }
            if (!_.isEqual(prop.value, compareProp.value)) {
                return { op: 'replace', path: `/properties/[key:${prop.key}]/value`, value: _.cloneDeep(prop.value) };
            }
        })));

        // skills
        patches.push(..._.compact(Object.entries(soAfter.skills).map(([key, skills]) => {
            const compareSkills = soBefore.skills[key];
            if (!compareSkills && !skills) {
                return;
            }
            if (!compareSkills) {
                return { op: 'add', path: `/skills/${key}`, value: _.cloneDeep(skills) };
            }
            if (!_.isEqual(skills, compareSkills)) {
                return { op: 'replace', path: `/skills/${key}`, value: _.cloneDeep(skills) };
            }
        })));

        // local
        if (soAfter.local !== soBefore.local) {
            patches.push({ op: 'replace', path: `/local`, value: soAfter.local });
        }

        if (patches.length === 0) {
            return null;
        }

        return {
            saveOnApi,
            type: 'crud',
            value: {
                op: 'patch',
                collection: 'smartobjects',
                key: soBefore.uuid,
                value: patches
            }
        };
    }

    /** public for test */
    _patchDocumentWithDifference(saveOnApi: boolean, docBefore: DocumentDto, docAfter: DocumentDto): WorkflowOperationDto {
        const patches = new PatchService<SmartModelDto>().compare(docBefore, docAfter);

        if (patches.length === 0) {
            return null;
        }

        return {
            saveOnApi,
            type: 'crud',
            value: {
                op: 'patch',
                collection: 'documents',
                key: docBefore.uuid,
                value: patches
            }
        };
    }

    /** public for test */
    _patchSmartObjectWithPatches(saveOnApi: boolean, key: string, patches: PatchPropertyDto[]): WorkflowOperationDto {
        return {
            saveOnApi,
            type: 'crud',
            value: {
                op: 'patch',
                collection: 'smartobjects',
                key,
                value: patches
            }
        };
    }
}
