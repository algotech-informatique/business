import { Injectable, EventEmitter } from '@angular/core';
import {
    SmartModelDto, SmartObjectDto, SmartPropertyObjectDto, SmartPropertyModelDto, PairDto, GenericListValueDto,
    PatchPropertyDto, GenericListDto, WorkflowInstanceDto,
} from '@algotech-ce/core';
import moment from 'moment';

import * as _ from 'lodash';
import { SoUtilsService } from '../../../workflow-interpretor/@utils/so-utils.service';
import { of, Observable, throwError, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { SoFormSearchComponent } from './so-form-search/so-form-search.component';
import { map, catchError, mergeMap, tap } from 'rxjs/operators';
import { CustomResolverParams, InterpretorTaskActionAssetDto } from '../../../../../interpretor/src/dto';
import { PropertiesOptionsDto } from '../../../dto/properties-options.dto';
import { GestionDisplaySettingsService, SettingsDataService, GenericListsService } from '@algotech-ce/angular';
import { PatchService } from '@algotech-ce/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowUtilsService } from '../../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { WorkflowTaskService } from '../../../workflow-interpretor/workflow-reader/workflow-task/workflow-task.service';

@Injectable()
export class SoFormService {

    constructor(
        private settingsDataService: SettingsDataService,
        private modalController: ModalController,
        private soUtils: SoUtilsService,
        private translate: TranslateService,
        private gestionDisplaySettingsService: GestionDisplaySettingsService,
        private gListsService: GenericListsService,
        private workflowUtilsService: WorkflowUtilsService,
        private workflowTaskService: WorkflowTaskService,
    ) { }

    private _options: PropertiesOptionsDto[] = [];
    private _models: SmartModelDto[] = [];
    private _objects: { object: SmartObjectDto, readOnly: boolean }[] = [];
    private _readOnly = false;
    private _actions: InterpretorTaskActionAssetDto[] = [];
    private _unique: PairDto[];
    private _contextUuid: string;
    private _instance: WorkflowInstanceDto;

    get models() {
        return this._models;
    }
    get actions() {
        return this._actions;
    }
    get readOnly() {
        return this._readOnly;
    }
    get options() {
        return this._options;
    }
    get contextUuid() {
        return this._contextUuid;
    }

    public current: SmartObjectDto;
    public initialize(readOnly: boolean, options: PropertiesOptionsDto[], contextUuid: string, instance: WorkflowInstanceDto) {

        this._models = this.settingsDataService.smartmodels;
        this._readOnly = readOnly;
        this._options = options;
        this._contextUuid = contextUuid;
        this._instance = instance;
        this._actions = [];
        this._unique = [];
    }

    setProperty(property: SmartPropertyObjectDto) {
        this.soUtils.setPropertyValue(this.current, this.getModel(this.current.modelKey), property.key, property.value);
    }

    objectIsValid(object: SmartObjectDto, tmp: SmartObjectDto[] = []) {
        const model = this.getModel(object.modelKey);

        const find = this._unique.find((u) => u.key === object.uuid);
        if (find && find.value === false) {
            return false;
        }

        const properties = _.filter(model.properties, (property) => {
            return this.soUtils.propertyIsShowed(property, model, this._options) && this.respectConditions(property, object, 'visible');
        });

        for (const propertyModel of properties) {
            const property = _.find(object.properties, (p: SmartPropertyObjectDto) => p.key === propertyModel.key);
            if (!this.propertyIsValid(propertyModel, property ? property.value : null, tmp)) {
                return false;
            }
        }
        return true;
    }

    propertyIsValid(propertyModel: SmartPropertyModelDto, value: any, tmp: SmartObjectDto[] = []) {
        if (!(this.soUtils.propertyIsValid(propertyModel, value, false))) {
            return false;
        }

        // check item
        if (!this.itemIsValid(propertyModel, value, tmp)) {
            return false;
        }

        return true;
    }

    respectConditions(prop: SmartPropertyModelDto, object: SmartObjectDto, mode: 'enabled' | 'visible') {
        const conditionMode = this.getOption(prop, object, 'conditionMode');
        const conditionOperator = this.getOption(prop, object, 'conditionOperator');
        const conditions = this.getOption(prop, object, 'conditions');

        if (conditions && conditionMode === mode) {
            return this.soUtils.respectConditions(conditions, this.getObjects(true), true, conditionOperator);
        }

        return true;
    }

    setUnique(smartObject: SmartObjectDto, unique: boolean) {
        const find = this._unique.find((u) => u.key === smartObject.uuid);
        if (!find) {
            this._unique.push({
                key: smartObject.uuid,
                value: unique
            });
        } else {
            find.value = unique;
        }
    }

    itemIsValid(propertyModel: SmartPropertyModelDto, value: any, tmp: SmartObjectDto[] = []) {
        if (propertyModel.keyType.startsWith('so:') && value) {
            const objects = this.getObjects(false);
            const values = _.isArray(value) ? value : [value];

            for (const uuid of values) {
                const object = _.find(objects, (so) => so.uuid === uuid);
                if (object && tmp.indexOf(object) === -1) { // check loop infinite
                    tmp.push(object);
                    if (!this.objectIsValid(object, tmp)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public getObjects(all = true): SmartObjectDto[] {
        return _.map
            (
                _.filter(this._objects, (object) => all || !object.readOnly),
                (item) => {
                    return item.object;
                }
            );
    }

    loadObjects(object: SmartObjectDto, objects: SmartObjectDto[], addedObjects: SmartObjectDto[]) {
        const subObjects = this.soUtils.findSubObjects(object, objects, this._models);
        const privateSO = _.concat(
            addedObjects,
            subObjects
        );

        this._objects = [{ object, readOnly: false }];
        this._objects.push(...
            _.map(
                objects,
                (so: SmartObjectDto) => {
                    return {
                        object: so,
                        readOnly: privateSO.indexOf(so) === -1,
                    };
                }
            ));
    }

    getModel(key: string): SmartModelDto {
        return this.soUtils.getModel(key, this.models);
    }

    getOption(property: SmartPropertyModelDto, object: SmartObjectDto,
        out: 'value' | 'conditions' | 'conditionMode' | 'conditionOperator' = 'value' ) {
        if (!object) {
            return null;
        }
        const option: PropertiesOptionsDto = _.find(this.options, (o) => o.model === object.modelKey);
        if (!option) {
            return null;
        }

        const find = _.find(option.properties, (p) => p.key === property.key);
        if (!find) {
            return null;
        }

        return find[out];
    }

    executeAction(actionKey: string, property: SmartPropertyModelDto, value: any): Observable<SmartObjectDto> {
        const objects = this.getObjects();
        const modelKey = property.keyType.replace('so:', '');
        switch (actionKey) {
            case 'search':
                return this.searchObject(modelKey).pipe(
                    map((so: SmartObjectDto) => {
                        if (!so) {
                            return _.find(objects, (find) => find.uuid === value);
                        }
                        return so;
                    })
                );
            case 'edit':
                return of(_.find(objects, (find) => find.uuid === value));
            case 'add':

                const model = this.getModel(modelKey);
                const object = this.soUtils.createInstance(model);
                this._objects.push({
                    object,
                    readOnly: false
                });

                return of(object);
            case 'delete':
                // rm cascade
                this.deleteCascade(value);
                return of(null);
            case 'detach':
                return of(null);
            default:
                return of(null);
        }
    }

    public searchObject(modelKey: string, multipleSelection = false, items: SmartObjectDto[] = []):
        Observable<SmartObjectDto | SmartObjectDto[]> {
        const onChangeValue = new EventEmitter<any>();
        let onDidDismiss;

        return from(this.modalController.create({
            component: SoFormSearchComponent,
            componentProps: {
                modelKey,
                multipleSelection,
                items,
                changeValue: onChangeValue,
            },
        })).pipe(
            mergeMap((modal: HTMLIonModalElement) => {
                return from(modal.present()).pipe(
                    tap(() => {
                        onDidDismiss = from(modal.onDidDismiss()).subscribe(() => {
                            onChangeValue.emit(null);
                        });
                    }),
                    mergeMap(() => {
                        return onChangeValue.pipe(
                            map((smartObjects: SmartObjectDto | SmartObjectDto[]) => {
                                onDidDismiss.unsubscribe();
                                modal.dismiss();
                                return smartObjects;
                            }),
                            tap((smartObjects: SmartObjectDto | SmartObjectDto[]) => {
                                if (smartObjects) {
                                    _.forEach(_.isArray(smartObjects) ? smartObjects : [smartObjects], (so) => {
                                        if (!_.find(this._objects, (find) => find.object.uuid === so.uuid)) {
                                            this._objects.push({
                                                object: so,
                                                readOnly: true,
                                            });
                                        }
                                    });
                                }
                            }),
                            catchError((err) => throwError(err)),
                        );
                    })
                );
            })
        );
    }

    public dataSource(
        property: SmartPropertyModelDto,
        skip: number,
        limit: number,
        search: string) {

        const option = this.getOption(property, this.current, 'value');
        if (!option.dataSource) {
            return of([]);
        }
        const taskModel = this.workflowUtilsService.getActiveTaskModel(this._instance);
        const params: CustomResolverParams = {
            searchParameters: {
                skip,
                limit,
                search
            }
        }

        const instance: WorkflowInstanceDto = _.cloneDeep(this._instance);
        instance.smartobjects = _.uniqBy([...this._objects.map((o) => o.object), ...instance.smartobjects], 'uuid');
        return this.workflowTaskService.calculateValue(instance, option.dataSource, taskModel, params);
    }

    public deleteCascade(uuid: string) {
        const objects = this.getObjects(false);
        // rm cascade
        const findObject: SmartObjectDto = _.find(objects, (so) => so.uuid === uuid);
        if (findObject) {
            const subObjects = this.soUtils.findSubObjects(findObject, objects, this._models);
            for (const smartObject of ([findObject, ...subObjects])) {
                const findIndex = _.findIndex(this._objects, (item) => item.object.uuid === smartObject.uuid);
                if (findIndex > -1) {
                    this._objects.splice(findIndex, 1);
                }
            }
        }
    }

    public processValue(property: SmartPropertyModelDto, value: any): any {
        return this.soUtils.formatProperty(property.keyType, value);
    }

    public unprocessValue(type: string, value: any): Observable<any> {
        if (type.startsWith('so:')) {
            const so: SmartObjectDto = _.find(this.getObjects(), (find: SmartObjectDto) => find.uuid === value);
            if (so) {
                const cbFindSo = (uuid) => of (_.find(this.getObjects(true), (son) => son.uuid === uuid));
                return this.gestionDisplaySettingsService.validateNameFromSettings(so, 'primary', cbFindSo);
            } else {
                return of('Object');
            }
        }
        switch (type) {
            case 'string':
            case 'boolean':
            case 'number':
                return of(value);
            case 'date': return of(new Date(value).toLocaleDateString(this.translate.currentLang));
            case 'time': return of(moment(value, 'HH:mm:ss').format('LT'));
            case 'datetime': return of(new Date(value).toLocaleString(this.translate.currentLang));
            case 'sys:comment': return of(value ? value.message : '');
            default: return of('');
        }
    }

    updateGlistNewValue(gList: GenericListDto, value: GenericListValueDto): Observable<any> {
        const oldList = _.cloneDeep(gList);
        gList.values.push(value);
        const settingsList: GenericListDto = _.find(this.settingsDataService.glists, (list: GenericListDto) => {
            return list.uuid === gList.uuid;
        });
        const patch: PatchPropertyDto[] = new PatchService<GenericListDto>().compare(oldList, gList);
        if (patch.length > 0) {
            return this.gListsService.patchProperty(gList.uuid, patch)
                .pipe(
                    map(() => {
                        if (settingsList) { settingsList.values.push(value); }
                    }),
                );
        } else {
            return of(null);
        }
    }

}
