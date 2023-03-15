import { Injectable } from '@angular/core';
import {
    SmartObjectDto, SmartPropertyObjectDto, SmartModelDto,
    SmartPropertyModelDto, FileUploadDto, GenericListDto, GenericListValueDto, ImportOptionsDto, PairDto
} from '@algotech/core';
import * as _ from 'lodash';
import { AuthService, SettingsDataService, TranslateLangDtoService, SmartObjectsService } from '@algotech/angular';
import { DocumentDto } from '@algotech/core';
import { PropertiesOptionsDto } from '../../dto/properties-options.dto';
import { SoUtils } from '../../../../interpretor/src';
import { WorkflowAbstractService } from '../workflow-abstract/workflow-abstract.service';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import papa from 'papaparse';
interface DisplayModel {
    model: string;
    displayFields: string[];
}

@Injectable()
export class SoUtilsService extends SoUtils {

    constructor(
        private authService: AuthService,
        private settingsDataService: SettingsDataService,
        private translateLangDtoService: TranslateLangDtoService,
        protected workflowAbstract: WorkflowAbstractService,
        private smartobjectsService: SmartObjectsService
    ) {
        super(workflowAbstract);
    }

    public csvToSo(file: File, smartModel: SmartModelDto, options: ImportOptionsDto): Observable<SmartObjectDto[]> {

        return new Observable((observer) => {
            papa.parse(file, {
                delimiter: options.delimiter ?? '',
                newline: options.newline ?? '',
                skipEmptyLines: true,
                complete: (res) => {
                    observer.next(this._csvDataToSo(res.data, smartModel, options));
                    observer.complete();
                },
                error: (err) => {
                    observer.error(err);
                    observer.complete();
                }
            });
        })
    }

    public csvColumns(file: File, smartModel: SmartModelDto, options?: ImportOptionsDto): Observable<PairDto[]> {
        return new Observable((observer) => {
            papa.parse(file, {
                preview: 1,
                delimiter: options?.delimiter ?? '',
                newline: options?.newline ?? '',
                skipEmptyLines: true,

                complete: (res) => {
                    const headers = res.data[0];
                    observer.next(this._bindColumn(headers, smartModel));
                    observer.complete();
                },
                error: (err) => {
                    observer.error(err);
                    observer.complete();
                }
            });
        })
    }

    getModel(key: string, models?: SmartModelDto[]): SmartModelDto {
        return super.getModel(key, this.settingsDataService.smartmodels);
    }

    // get all SmartObjects filter with properties / page by page
    getAllByProperties(querySearch: any): Observable<SmartObjectDto[]> {
        return this.smartobjectsService.QuerySearchSO(querySearch, 0, 10000);
    }

    // get all SmartObjects page by page
    getAllByModel(model: string): Observable<SmartObjectDto[]> {
        const limit = 100;
        const page = 0;
        return this.accByModel(model, page, limit);
    }

    accByModel(
        modelKey: string,
        page: number,
        limit: number,
        smartobjects: SmartObjectDto[] = [],
    ) {
        return this.smartobjectsService.getByModel(modelKey, page, limit).pipe(
            mergeMap((res: SmartObjectDto[]) => {
                smartobjects.push(...res);

                if (res.length < limit) {
                    return of(smartobjects);
                } else {
                    return this.accByModel(modelKey, ++page, limit, smartobjects);
                }
            })
        );
    }

    // transform SmartObject to object and add her uuid in object
    public soToObject<T>(so: SmartObjectDto): T {
        const myObject = _.assign(...so.properties.map((p: any) => {
            const obj = JSON.parse('{"' + p.key + '":null}');
            obj[p.key] = p.value;
            return obj;
        }));
        return Object.assign(myObject, { uuid: so.uuid }) as T;
    }

    // transform object to SmartObjectDto
    public objectToSo(object: any, model: string): SmartObjectDto {

        const toPropertiesSmartObject = _.toPairs(object).map(p => {
            return { 'key': p[0], 'value': p[1] };
        });
        const idxUuid: number = _.findIndex(toPropertiesSmartObject, { key: 'uuid' });
        let uuid: { key: string, value: string };
        if (idxUuid > -1) {
            uuid = _.clone(toPropertiesSmartObject[idxUuid]);
            toPropertiesSmartObject.splice(idxUuid, 1);
        }

        const toSmartObject: any = {};
        Object.assign(toSmartObject, { 'modelKey': model }, { properties: toPropertiesSmartObject }, { 'skills': {} });
        if (uuid) { Object.assign(toSmartObject, { uuid: uuid.value }); }
        return toSmartObject;
    }

    getSmartModelProperty(smKey: string, propKey: string): SmartPropertyModelDto {
        const smartModel: SmartModelDto = _.find(this.settingsDataService.smartmodels, (sm: SmartModelDto) => sm.key === smKey);
        if (!smartModel) { return null; }
        return _.find(smartModel.properties, (sm: SmartPropertyModelDto) => sm.key === propKey);
    }

    // get value of key/value from SmartObject's properties
    public getProperty(so: SmartObjectDto, key: string) {
        if (!so) { return null; }
        const kv = _.find(so.properties, { key });
        if (!kv) { return null; }
        return kv;
    }

    public getPropertyByIndex(so: SmartObjectDto, index: number) {
        if (!so) {
            return null;
        }
        const kv = so.properties[index];
        if (!kv) {
            return null;
        }
        return kv;
    }

    public getExtended(sm: SmartModelDto, key: string, type: string) {
        const findProp = sm.properties.find((prop) => {
            return prop.key.startsWith(`${SoUtils.EXPAND}${key}`) && prop.keyType === type;
        });
        if (!findProp) {
            return null;
        }
        return findProp;
    }

    public getPropertyForElement<T>(ele, key, type, preferedLang: string): T {
        if (type === 'so') {
            return this.getPropertyValue(ele, key);
        } else {
            return _.find(ele[key], (element) => element.lang === preferedLang).value;
        }
    }

    // get value of key/value from SmartObject's properties
    public getPropertyValue<T>(so: SmartObjectDto, key: string): T {
        const kv = this.getProperty(so, key);
        if (!kv || kv.value === undefined || kv.value === null) {
            return null;
        }
        const ret: T = kv.value as T;
        return ret;
    }

    getPropertyDisplay(so: SmartObjectDto, key: string): string {
        const property: { key: string, value: string } = this.getProperty(so, key);
        if (!property) { return null; }
        const propModel: SmartPropertyModelDto = this.getSmartModelProperty(so.modelKey, key);
        if (propModel && propModel.keyType === 'boolean') {
            return (_.isBoolean(property.value) && property.value) || property.value === 'true' ?
                `✔ ${this.translateLangDtoService.transform(propModel.displayName)}` :
                `✕ ${this.translateLangDtoService.transform(propModel.displayName)}`;
        }
        if (propModel.keyType === 'string' && propModel.items && propModel.items !== '') {
            const item = _.isArray(propModel.items) ? propModel.items[0] : propModel.items;
            const list = _.find(this.settingsDataService.glists, (lst: GenericListDto) => lst.key === item);
            if (!list) { return property.value; }
            const ele: GenericListValueDto = _.find(list.values, (element: GenericListValueDto) => element.key === property.value);

            if (!ele || !ele.value) {
                return null;
            }
            return this.translateLangDtoService.transform(ele.value);
        }

        return property.value;
    }

    propertyIsShowed(property: SmartPropertyModelDto, model: SmartModelDto, options?: PropertiesOptionsDto[]) {

        const option = options ? _.find(options, (o) => o.model === model.key) : null;
        const filter = option ? _.map(option.properties, (p) => p.key) : null;

        if (!property) {
            return false;
        }

        // hidden
        if (property.hidden) {
            return false;
        }

        // filter
        if (filter && filter.length > 0 && filter.indexOf(property.key) === -1) {
            return false;
        }

        // permissions
        if (!this.isAuthorized(property, model, { eRead: true })) {
            return false;
        }

        return true;
    }

    public isAuthorized(property: SmartPropertyModelDto, model: SmartModelDto,
        state: { eRead?: boolean, eWrite?: boolean } = { eRead: true }) {
        if (this.authService.localProfil.groups.indexOf('sadmin') > -1) {
            return true;
        }

        if (state.eRead) {
            return (
                _.intersection(model.permissions.R, this.authService.localProfil.groups).length > 0 ||
                _.intersection(model.permissions.RW, this.authService.localProfil.groups).length > 0
            ) && (
                    _.intersection(property.permissions.R, this.authService.localProfil.groups).length > 0 ||
                    _.intersection(property.permissions.RW, this.authService.localProfil.groups).length > 0
                );
        }

        if (state.eWrite) {
            return _.intersection(model.permissions.RW, this.authService.localProfil.groups).length > 0 &&
                _.intersection(property.permissions.RW, this.authService.localProfil.groups).length > 0;
        }
        return true;
    }

    public getFilteredSo(so: SmartObjectDto, filteredKeys: string[]): SmartObjectDto {
        const filteredProps = _.filter(so.properties, (prop: SmartPropertyObjectDto) => {
            return _.findIndex(filteredKeys, prop.key) === -1;
        });
        return Object.assign({}, so, { properties: filteredProps });
    }

    public getFilteredSONoKeys(so: SmartObjectDto, smartModels: SmartModelDto[]): SmartObjectDto {
        const sm: SmartModelDto = _.find(smartModels, (mySM: SmartModelDto) => mySM.key === so.modelKey);
        if (sm) {
            const aField = sm.properties[0].key;
            const bField = sm.properties[1].key;
            const fields = [aField, bField];
            return this.getFilteredSo(so, fields);
        }
    }

    public getDisplayModel(model: SmartModelDto): DisplayModel {
        const aField: string = (model.properties.length > 0) ? model.properties[0].key : '';
        const bField: string = (model.properties.length > 1) ? model.properties[1].key : '';
        const display: DisplayModel = {
            model: model.key,
            displayFields: [aField, bField]
        };
        return display;
    }

    /**
     * @param dataURI
     * @param contentType
     * @return Blob
     * @description
     * Turn base 64 image into a blob, so we can send it using multipart/form-data posts
     */
    public dataURItoBlob(dataURI: string, contentType: string): Blob {
        const byteString = window.atob(dataURI);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([int8Array], { type: contentType });
    }

    getModelsBySkill(skill: string, smartModels: SmartModelDto[]): SmartModelDto[] {
        return _.reduce(smartModels, (result: SmartModelDto[], sm: SmartModelDto) => {
            const skillKey: string = skill.replace('sk:', '');
            if (sm.skills && sm.skills[skillKey]) {
                result.push(sm);
            }
            return result;
        }, []);
    }

    

    public skToFileUpload(doc: DocumentDto): FileUploadDto {
        const file: FileUploadDto = {
            userID: this.authService.localProfil.id,
            tags: _.join(doc.tags, ', '),
            documentID: doc.uuid,
            forceIndexation: 'false',
            reason: doc.name,
            versionID: doc.versions[0].uuid,
            metadatas: doc.metadatas ? JSON.stringify(doc.metadatas) : '',
        };
        return file;
    }

    findSubObjects(object: SmartObjectDto, objects: SmartObjectDto[], models: SmartModelDto[], tmp: SmartObjectDto[] = []) {
        const model = this.getModel(object.modelKey, models);
        return _.reduce((object.properties), (results, property: SmartPropertyObjectDto) => {

            if (property.value) {
                const propertyModel = model.properties.find((p) => p.key === property.key);

                if (propertyModel && propertyModel.keyType.startsWith('so:') && propertyModel.composition) {
                    const uuid: string[] = _.isArray(property.value) ? property.value : [property.value];
                    const subObjects: SmartObjectDto[] = _.filter(objects, (so) => {
                        if (tmp.indexOf(so) > -1) {
                            return false; // loop infinite
                        }
                        return uuid.indexOf(so.uuid) > -1;
                    });

                    results.push(...subObjects);
                    for (const subObject of subObjects) {
                        results.push(...this.findSubObjects(subObject, objects, models, results));
                    }
                }
            }
            return results;
        }, []);
    }
}
