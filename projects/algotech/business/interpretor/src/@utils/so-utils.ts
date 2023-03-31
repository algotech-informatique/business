import {
    SmartObjectDto, SmartPropertyObjectDto, SmartModelDto,
    SmartPropertyModelDto, ATSkillsDto, PairDto, WorkflowInstanceContextDto, GenericListDto, GenericListValueDto,
    LangDto, DocumentDto, SysFile, ImportOptionsDto
} from '@algotech-ce/core';
import * as _ from 'lodash';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { InterpretorAbstract } from '../interpretor-abstract/interpretor-abstract';
import { Observable } from 'rxjs';
import { InterpretorSoUtils } from '../interpretor-reader/interpretor-so/interpretor-so-utils';
import { SmartObjectMapped } from '../dto/interfaces/smart-object-mapped';

export abstract class SoUtils {

    static EXPAND = '~__';
    
    constructor(protected interpretorAbstract: InterpretorAbstract) {
    }

    abstract csvToSo(file: Blob|Buffer, smartModel: SmartModelDto, options: ImportOptionsDto): Observable<SmartObjectDto[]>;

    abstract getAllByProperties(querySearch: any, context?: WorkflowInstanceContextDto);

    abstract getAllByModel(model: string, context?: WorkflowInstanceContextDto): Observable<SmartObjectDto[]>;

    getModel(key: string, models: SmartModelDto[]): SmartModelDto {
        const model = _.find(models, (m) => m.key === key);
        if (!model) {
            throw new Error(`Model ${key} not found`);
        }
        return model;
    }

    getModelByType(type: string, models: SmartModelDto[]): SmartModelDto {
        return this.getModel(type.replace('so:', ''), models);
    }

    public typeIsSysObject(type: string) {
        return type && type.startsWith('sys:');
    }

    public typeIsSmartObject(type: string) {
        return type && (type.startsWith('so:') || type.startsWith('sk:'));
    }

    public typeIsAbstract(type: string) {
        return type && (type === 'so:*' || type.startsWith('sk:'));
    }

    public isSmartObject(value: any) {
        if (!_.isObject(value)) {
            return false;
        }
        return !!value.modelKey && Array.isArray(value.properties) && value.properties.every((v) => v.key) && !!value.skills;
    }

    public createInstance(model: SmartModelDto): SmartObjectDto {

        const properties: SmartPropertyObjectDto[] = model.properties.map((p: SmartPropertyModelDto) => this._createProperty(p));
        const skills: ATSkillsDto = this.createSkill();
        const instance: SmartObjectDto = {
            uuid: UUID.UUID(),
            modelKey: model.key,
            properties,
            skills
        };
        return instance;
    }

    public isReset(value: any): boolean {
        return _.isEqual(value, { reset: true }) || _.isEqual(value, [{ reset: true }]);
    }

    public createObjectProperties(smartObject: SmartObjectDto, model: SmartModelDto, properties: PairDto[], cumul: boolean) {
        _.forEach(properties, (prop: PairDto) => {
            if (prop.value != null) {
                if (this.isReset(prop.value)) {
                    this._resetProperty(prop, smartObject, model);
                } else {
                    this._assignProperty(prop, smartObject, model, cumul);
                }
            }
        });
    }

    _csvDataToSo(data: string[][], smartModel: SmartModelDto, options: ImportOptionsDto): SmartObjectDto[] {
        const smartObjects: SmartObjectDto[] = [];
        if (data.length === 0) {
            return [];
        }

        const soProps = {};
        for (const item of options.columns ?? this._bindColumn(data[0], smartModel)) {
            soProps[item.key] = item.value;
        }
        
        for (let iRow = 1; iRow < data.length; iRow++) {
            const smartObject = this.createInstance(smartModel);
            
            for (let iColumn = 0; iColumn < data[0].length; iColumn++) {
                const soProp: SmartPropertyModelDto = soProps[(<string>data[0][iColumn])];
                if (!soProp || this.typeIsSmartObject(soProp.keyType) || this.typeIsSysObject(soProp.keyType)) {
                    continue;
                }

                let value: any = (<string>data[iRow][iColumn]).trim();
                value = soProp.multiple ? (value ? value.split('|') : []) : value;

                const format = options.propertiesFormat?.find((format) => format.key === soProp.key)?.value ??
                    options.dateDefaultFormat;

                this.setPropertyValue(smartObject, smartModel, soProp.key, value, false, format);
            }

            smartObjects.push(smartObject);
        }

        return smartObjects;
    }

    _bindColumn(keys: string[], smartModel: SmartModelDto): PairDto[] {
        if (!keys) {
            return [];
        }
        return keys.map((key) => {
            const findProperty = smartModel.properties.find((prop) => {
                if (this.typeIsSmartObject(prop.keyType) || this.typeIsSysObject(prop.keyType)) {
                    return false;
                }

                if (key.toUpperCase() !== prop.key.toUpperCase()) {
                    return false;
                }

                return true;
            });
            return {
                key,
                value: findProperty
            }
        });
    }

    _resetProperty(prop: PairDto, smartObject: SmartObjectDto, model: SmartModelDto) {
        const index = _.findIndex(model.properties, (pr: SmartPropertyModelDto) => pr.key === prop.key);
        const indexProp = _.findIndex(smartObject.properties, (pr: SmartPropertyObjectDto) => pr.key === prop.key);
        smartObject.properties[indexProp] = this._createProperty(model.properties[index]);
    }

    _assignProperty(prop: PairDto, smartObject: SmartObjectDto, model: SmartModelDto, cumul: boolean) {
        const isArray = _.isArray(prop.value);
        const datas = isArray ? (_.isArray(prop.value?.[0])) ? prop.value[0] : prop.value : [prop.value];
        const values = _.map(datas, (data) => {

            if (data instanceof SmartObjectDto) {
                return (data as SmartObjectDto).uuid;
            } else {
                return data;
            }
        });
        if (isArray) {
            this.setPropertyValue(smartObject, model, prop.key, values, cumul);
        } else {
            if (values.length === 1) {
                this.setPropertyValue(smartObject, model, prop.key, values[0]);
            }
        }
    }

    public repairInstance(object: SmartObjectDto, model: SmartModelDto) {
        let repair = false;
        const properties: SmartPropertyObjectDto[] = model.properties.map((p: SmartPropertyModelDto) => this._createProperty(p));
        for (const property of properties) {
            const propertyObject: SmartPropertyObjectDto = object.properties.find((p) => p.key === property.key);
            const propertyModel: SmartPropertyModelDto = model.properties.find((p) => p.key === property.key);

            // multiple && !array
            if (propertyModel.multiple) {
                if (propertyObject && propertyObject.value && !_.isArray(propertyObject.value)) {
                    repair = true;
                    this.setPropertyValue(object, model, property.key, [propertyObject.value], false);
                }
            }

            // unknow or not assign
            if ((!propertyObject) || (!propertyObject.value && property.value)) {
                repair = true;
                this.setPropertyValue(object, model, property.key, property.value);
            }
        }

        return repair;
    }

    public transformListObject(objects: Array<SmartObjectDto | SysFile>, documents: DocumentDto[]): SysFile[] {
        const versions: SysFile[] = [];

        _.map(objects, (document) => {
            if (document instanceof SmartObjectDto) {
                if (document.skills.atDocument && document.skills.atDocument.documents) {
                    versions.push(..._.map(this.getDocuments(document, documents), (doc: DocumentDto) => {
                        return this.skToSysFile(doc);
                    }));
                }
            } else {
                versions.push(document);
            }
        });

        return versions;
    }

    public skToSysFile(doc: DocumentDto) {
        const file: SysFile = {
            documentID: doc.uuid,
            ext: doc.ext,
            name: doc.name,
            dateUpdated: doc.versions[0].dateUpdated,
            versionID: doc.versions[0].uuid,
            size: doc.versions[0].size,
            user: doc.versions[0].userID,
            reason: doc.versions[0].reason,
            tags: doc.tags,
            metadatas: doc.metadatas,
            annotations: doc.versions[0].annotations
        };
        return file;
    }

    public getDocuments(so: SmartObjectDto, documents: DocumentDto[]) {
        return so.skills.atDocument.documents.reduce((results, docUuid: string) => {
            const findDoc = documents.find((d) => d.uuid === docUuid);
            if (findDoc) {
                results.push(findDoc);
            }
            return results;
        }, []);
    }

    public setPropertyValue(so: SmartObjectDto, sm: SmartModelDto, key: string, value: any, cumul = false, format?: string): SmartObjectDto {
        const propertyModel: SmartPropertyModelDto = _.find(sm.properties, { key });
        const values = value == null ? null : (_.isArray(value)) ? value : [value];

        // no model
        if (!propertyModel) {
            return so;
        }
        // data incorrect
        if (!propertyModel.multiple && values && values.length !== 1) {
            return so;
        }

        const formatValues = values ? _.map(values, (val) => {
            return this.formatProperty(propertyModel.keyType, val, format);
        }) : null;

        const _value = formatValues == null ? null : propertyModel.multiple ? formatValues : formatValues[0];
        // property not create
        const indexProp = _.findIndex(so.properties, { key });
        if (indexProp === -1) {
            so.properties.push({ key, value: _value });
            return so;
        }

        // cumul
        if (propertyModel.multiple && cumul) {
            if (_value != null) {
                so.properties[indexProp].value.push(..._value);
            }
        } else {
            // replace
            so.properties[indexProp].value = _value;
        }
        return so;
    }

    createSkill(key?: string): ATSkillsDto {

        const skills: ATSkillsDto = {
            atDocument: {
                documents: []
            },
            atGeolocation: {
                geo: []
            },
            atTag: {
                tags: []
            },
            atSignature: null,
            atMagnet: {
                zones: []
            },
        };

        if (key) {
            return skills[key];
        }
        return skills;
    }

    public formatProperty(type: string, value: any, format?: string): any {
        if (value == null) {
            return null;
        }
        switch (type) {
            case 'boolean':
                return this.strToBool(value);
            case 'number':
                return _.isString(value) ? +value.replace(',', '.') : +value;
            case 'date':
                return moment(value, format).isValid() ? moment(value, format).startOf('day').format() : null;
            case 'time': {
                if (moment(value, format).isValid()) {
                    return moment(value, format).format('HH:mm:ss');
                }
                if (moment(value, 'HH:mm:ss').isValid()) {
                    return moment(value, 'HH:mm:ss').format('HH:mm:ss');
                }
                if (moment(value, 'HH:mm').isValid()) {
                    return moment(value, 'HH:mm').format('HH:mm:ss');
                }
                if (moment(value, 'LT').isValid()) {
                    return moment(value, 'LT').format('HH:mm:ss');
                }
                return null;
            }
            case 'datetime':
                return moment(value, format).isValid() ? moment(value, format).format() : null;
            default:
                return value;
        }
    }

    private strToBool(value: any) {
        if (_.isBoolean(value)) {
            return value;
        }
        return [
            'yes',
            'true',
            true,
            'y',
            1,
            '1'
        ].includes(value);
    }

    private _createProperty(property: SmartPropertyModelDto): SmartPropertyObjectDto {
    
        let value = null;
        if (property.defaultValue) {
            value = property.defaultValue;
        } else if (property.multiple) {
            value = [];
        }

        const prop: SmartPropertyObjectDto = {
            key: property.key,
            value
        };
        return prop;
    }

    public propertyIsValid(property: SmartPropertyModelDto, value: any, checkFormat = true) {
        if (property.key.startsWith(SoUtils.EXPAND)) {
            return true;
        }

        if (!property.required) {
            if (!this._checkDefined(property, value)) {
                return true;
            }

            return !checkFormat || this._checkFormat(property, value);
        } else {

            return this._checkDefined(property, value) && (!checkFormat || this._checkFormat(property, value));
        }
    }

    private transformNestedData(value: any, smartobjects: SmartObjectDto[]): any {
        if (value instanceof SmartObjectDto) {
            const findSo = _.find(smartobjects, (so) => so.uuid === value.uuid);
            return findSo;
        }

        if (Array.isArray(value) && value.length > 0 && value[0] instanceof SmartObjectDto) {
            return _.map(value, (item) => {
                const findSo = _.find(smartobjects, (so) => so.uuid === item.uuid);
                return findSo;
            });
        }
        return value;
    }

    nestedSmartObjectsGetValue(smartobjects: SmartObjectDto[], prop, glists: GenericListDto[], lang: string, value: any) {

        const findSo = _.find(smartobjects, so => so.uuid === value);
        if (findSo) {
            return findSo;
        } else {
            if (prop.items) {
                let val = value;
                if (!Array.isArray(prop.items)) {
                    const g = (glists) ? _.find(glists, (gl: GenericListDto) => gl.key === prop.items) : null;
                    const Langs: GenericListValueDto = (g) ? _.find(g.values, (v: GenericListValueDto) => v.key === value) : { value: [] };
                    const l: LangDto = (Langs && Langs.value) ? _.find(Langs.value, (v: LangDto) => v.lang === lang) : null;
                    val = (l) ? l.value : val;
                }

                return val;
            } else {
                switch (prop.keyType) {
                    case 'date':
                        return moment(value).format('DD/MM/YYYY');
                    case 'datetime':
                        return moment(value).format('DD/MM/YYYY hh:mm:ss');
                    case 'time':
                        return moment(value).format('hh:mm:ss');
                    default:
                        return value;
                }
            }

        }
    }

    public respectConditions(conditions: string | string[], so: SmartObjectDto | SmartObjectDto[],
        strictEquality = false, operator = 'and') {

        const _conditions = _.isArray(conditions) ? conditions : [conditions];
        const action = operator === 'and' ? _.every : _.some;
        return action(_conditions, condition => {
            // modelKey.PROP=value
            try {
                const path = condition.split('=')[0];
                const propertyValue = condition.split('=')[1].toUpperCase();

                const split = InterpretorSoUtils.split(path);
                const modelKey = split[0];
                const propertyKey = split[1];

                const smartobjects = Array.isArray(so) ? so : _.compact([so]);

                if (smartobjects.length === 0) {
                    return false;
                }

                const smartobject = smartobjects.find((find) => find.modelKey === modelKey);
                if (!smartobject) {
                    return false;
                }

                const findProp = _.find(smartobject.properties, (p: SmartPropertyObjectDto) => p.key === propertyKey);
                if (!findProp || findProp.value === null || findProp.value === undefined) {
                    return false;
                }

                if (propertyValue === '*') {
                    return true;
                }

                // strict
                if (strictEquality) {
                    if (_.isArray(findProp.value)) {
                        return _.some(_.compact(findProp.value), (value: string) => value.toString().toUpperCase() === propertyValue);
                    } else {
                        return findProp.value.toString().toUpperCase() === propertyValue.toUpperCase();
                    }
                }

                // contains
                if (_.isArray(findProp.value)) {
                    return _.some(_.compact(findProp.value), (value: string) => value.toString().toUpperCase().includes(propertyValue));
                } else {
                    return findProp.value.toString().toUpperCase().includes(propertyValue.toUpperCase());
                }
            } catch {
                return false;
            }
        });
    }

    buildJson(sos: SmartObjectDto[], allSmartObjects: SmartObjectDto[], smartModels: SmartModelDto[], indexes: Object, parents: SmartObjectDto[] = null): any[] {
        let obj = [];
        for (const so of sos) {
            const existsObj: SmartObjectDto = parents?.find((parent) => parent.uuid === so.uuid);
            if (existsObj) {
                return [];
            }
            obj.push(this.buildJsonObject(so, allSmartObjects, smartModels, indexes, parents ? [...parents, so] : [so]));
        }
        return obj;
    }

    buildJsonObject(so: SmartObjectDto, allSmartObjects: SmartObjectDto[], smartModels: SmartModelDto[], indexes: Object, parents: SmartObjectDto[]): Object {
        const obj = {};
        const model: SmartModelDto = this.getModel(so.modelKey, smartModels);
        for (const prop of so.properties) {
            const propModel: SmartPropertyModelDto = model.properties.find((prp: SmartPropertyModelDto) => prp.key === prop.key);
            if (propModel && propModel.keyType.startsWith('so:')) {

                const findObj: SmartObjectDto[] = (propModel.multiple) ?
                    _.compact(_.map(prop.value, (val) => InterpretorSoUtils.quickFind(allSmartObjects, indexes, val))) :
                    _.compact([InterpretorSoUtils.quickFind(allSmartObjects, indexes, prop.value)]);

                if (findObj.length !== 0) {
                    const property = this.buildJson(findObj, allSmartObjects, smartModels, indexes, parents);

                    if (propModel.multiple) {
                        obj[prop.key] = property;
                    } else if (property.length > 0) {
                        obj[prop.key] = property[0];
                    }
                }
            } else {
                obj[prop.key] = prop.value;
            }
        }
        return obj;
    }

    nestedSmartObjectsProps(inputs: PairDto[], smartobjects: SmartObjectDto[], context: WorkflowInstanceContextDto, byClone = true): any {
        const _smartobjects = (byClone) ? _.uniqBy(_.cloneDeep(smartobjects), 'uuid') : smartobjects;

        _.forEach(_smartobjects, (smartobject: SmartObjectDto) => {
            _.forEach(smartobject.properties, (property: SmartPropertyObjectDto) => {
                const sm: SmartModelDto = (context.smartmodels) ? _.find(context.smartmodels, (s: SmartModelDto) => s.key === smartobject.modelKey) : null;
                const p = (sm) ? _.find(sm.properties, (p: SmartPropertyModelDto) => p.key === property.key) : { keyType: 'string' };
                if (Array.isArray(property.value)) {
                    smartobject[property.key] = _.map(property.value, (item) => {
                        return this.nestedSmartObjectsGetValue(_smartobjects, (p) ? p : { keyType: 'string' }, context.glists, context.user.preferedLang, item);
                    });
                } else {
                    smartobject[property.key] = this.nestedSmartObjectsGetValue(_smartobjects, (p) ? p : { keyType: 'string' }, context.glists, context.user.preferedLang, property.value);
                }
            });
            delete smartobject.properties;
            delete smartobject.modelKey;
            delete smartobject.skills;
        });

        return _.fromPairs(_.reduce(inputs, (results, pair) => {
            if (pair && pair.value) {
                results.push([`${pair.key}`, this.transformNestedData(pair.value, _smartobjects)]);
            }
            return results;
        }, []));
    }

    getSubDoc(uuid: string, context: WorkflowInstanceContextDto) {
        return this.interpretorAbstract.getSubDoc(context, { uuid }, true, false);
    }

    private _checkDefined(property: SmartPropertyModelDto, value: any) {
        if (property.multiple) {
            if (!_.isArray(value) || value.length === 0) {
                return false;
            }
        }
        const values = _.isArray(value) ? value : [value];

        return _.every(values, (v) => {
            switch (property.keyType) {
                case 'sys:comment':
                    return v && v.message && v.message !== '';
                default:
                    return v !== '' && v !== null && v !== undefined;
            }
        });
    }

    private _checkFormat(property: SmartPropertyModelDto, value: any) {
        const values = _.isArray(value) ? value : [value];
        return _.every(values, (v) => {
            switch (property.keyType) {
                case 'string':
                    return _.isString(v);
                case 'boolean':
                    return _.isBoolean(v);
                case 'number':
                    return _.isNumber(v);
                case 'date':
                    return moment(v).isValid();
                case 'time':
                    return moment(v, 'HH:mm:ss').isValid();
                case 'datetime':
                    return moment(v).isValid();
                case 'sys:comment':
                    return v && v.message && v.message !== '';
                default:
                    return true;
            }
        });
    }

    /*  Mapped */

    public smartObjectMapped(smartModel: SmartModelDto, smartModels: SmartModelDto[], object: any,
        smartobjects: SmartObjectDto[] = [], objects: SmartObjectDto[] = []): SmartObjectMapped {
        const soObject: SmartObjectDto = this.createInstance(smartModel);

        if (object.uuid) {
            soObject.uuid = object.uuid;
        }

        const _object = {};
        Object.entries(object).forEach(([key, value]) => {
            _object[key.toUpperCase()] = value;
        });

        for (const prop of smartModel.properties) {
            const key = prop.key.toUpperCase();
            const value = _object.hasOwnProperty(key) ? _object[key] : null;
            this.smartObjectMappedProperty(soObject, smartModel, prop, smartModels, value, smartobjects, objects);
        }

        smartobjects.push(soObject);
        objects.push(object);

        return {
            smartobjects,
            objects,
            uuid: soObject.uuid
        };
    }

    public smartObjectMappedProperty(soObject: SmartObjectDto, smartModel: SmartModelDto,
        prop: SmartPropertyModelDto, smartModels: SmartModelDto[], value: any, smartobjects: SmartObjectDto[], objects: SmartObjectDto[] = []) {

        if (value === null || value === undefined || !this.propertyIsValid(prop, value)) {
            return;
        }
        if (!this.typeIsSmartObject(prop.keyType)) {
            this.setPropertyValue(soObject, smartModel, prop.key, value, true);
            return;
        }
        const snModel: SmartModelDto = this.getModelByType(prop.keyType, smartModels);
        const getUuid = (value: any) => {
            if (_.isObject(value)) {
                return this.smartObjectMapped(snModel, smartModels, value, smartobjects, objects).uuid;
            } else if (this.isUUID(value)) {
                return value;
            }
            return null;
        }
        if (prop.multiple) {
            const values: any[] = _.isArray(value) ? value : [value];
            const uuids = _.compact(values.map((val) => getUuid(val)));
            this.setPropertyValue(soObject, smartModel, prop.key, uuids, true);
        } else {
            const uuid = getUuid(value);
            if (uuid) {
                this.setPropertyValue(soObject, smartModel, prop.key, uuid, true);
            }
        }
    }

    private isUUID(str: string) {
        const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        return regexExp.test(str); // true
    }
}
