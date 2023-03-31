import { Observable, zip, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorTransferTransitionDto, InterpretorValidateDto, TaskMergeV2Dto } from '../dto';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { TaskMergeError } from '../error/tasks-error';
import { SmartModelDto, SmartObjectDto, SmartPropertyObjectDto, SmartPropertyModelDto } from '@algotech-ce/core';
import { InterpretorSoUtils } from '../interpretor-reader/interpretor-so/interpretor-so-utils';

export interface QuerySearch {
    modelKey: string;
    order: any[];
    filter: Filter[];
}

export interface Filter {
    key: string;
    value: {
        criteria: string;
        value: any[] | any,
        type: string;
    }
};

export class TaskMergeV2 extends TaskBase {
    _task: InterpretorTaskDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        this._task = task;
        const customData = (task.custom as TaskMergeV2Dto);
        return zip(
            customData.smartModel(),
            customData.array(),
            customData.propType(),
            customData.propToMerge ? customData.propToMerge() : of([]),
            customData.saveOnApi ? customData.saveOnApi() : of(true)
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-044', err, TaskMergeError);
            }),
            mergeMap((values: any[]) => {

                const smartModel: SmartModelDto = values[0];
                const objects: SmartObjectDto[] = values[1];
                const propType: string[] = values[2];
                const propToMerge: string[] = values[3];
                const saveOnApi = values[4];

                const querySearch: QuerySearch = this._querySearch(smartModel, objects, propType);
                return this.soUtils.getAllByProperties(querySearch, task.instance.context).pipe(
                    catchError((err) => {
                        throw new TaskMergeError('ERR-045', `{{FAILED-TO-FETCH-DATA-BY-MODEL}} : ${err.message}`);
                    }),
                    map((smartObjects: SmartObjectDto[]) => {
                        InterpretorSoUtils.pushOrReplaceSo(task.instance.smartobjects, smartObjects, task.instance.context?.custom?.indexes);
                        return {
                            smartModel,
                            smartObjectsFromDB: _.cloneDeep(smartObjects),
                            objects,
                            propType,
                            propToMerge,
                            saveOnApi
                        }
                    })
                )
            }),
            map((data: { smartModel: SmartModelDto, smartObjectsFromDB: SmartObjectDto[], objects: SmartObjectDto[], propType: string[], propToMerge: string[], saveOnApi }) => {

                const so2Add: SmartObjectDto[] = [];
                const so2Update: SmartObjectDto[] = [];
                for (const object of data.objects) {
                    let toMerge = this._filterSmartObject(object, data.smartObjectsFromDB, data.propType);
                    if (!toMerge) {
                        toMerge = this.soUtils.createInstance(data.smartModel);
                        // push to new
                        this._pushObject(so2Add, data.propToMerge, toMerge, data.smartModel, object.properties);
                    } else {
                        // push to update
                        this._pushObject(so2Update, data.propToMerge, toMerge, data.smartModel, object.properties)
                    }
                }

                const transfers: InterpretorTransferTransitionDto[] = [{
                    saveOnApi: data.saveOnApi,
                    data: this._getTransitionData(0),
                    type: 'smartobjects',
                    value: so2Add,
                }, {
                    saveOnApi: data.saveOnApi,
                    data: this._getTransitionData(1),
                    type: 'smartobjects',
                    value: so2Update,
                }];
                const validation: InterpretorValidateDto = {
                    transitionKey: 'done',
                    transfers: transfers
                };
                return validation;
            }),
        );
    }

    /* Only for tests */
    _filterSmartObject(object: SmartObjectDto, objectsBD: SmartObjectDto[], filterKeys: string[]): SmartObjectDto {
        const propsObject: SmartPropertyObjectDto[] = _.filter(object.properties, (p: SmartPropertyObjectDto) => filterKeys.includes(p.key));
        if (propsObject.length !== filterKeys.length) {
            return null;
        }

        const smartObject: SmartObjectDto = _.find(objectsBD, (so: SmartObjectDto) => {
            const propsSmartObject: SmartPropertyObjectDto[] = _.filter(
                so.properties,
                (p: SmartPropertyObjectDto) => filterKeys.includes(p.key)
            );
            return _.isEqual(propsObject, propsSmartObject);
        })
        return smartObject;
    }

    /* Only for tests */
    _querySearch(modelKey: SmartModelDto, objects: SmartObjectDto[], filterKeys: string[]): QuerySearch {
        const querySearch = {
            modelKey: modelKey.key,
            order: [],
            filter: this.createQueryProp(modelKey, objects, filterKeys),
        }
        return querySearch;
    }

    private createQueryProp(smartModel: SmartModelDto, objects: SmartObjectDto[], filterKeys: string[]): Filter[] {

        return _.flatten(_.reduce(filterKeys, (result, key: string) => {
            const props: SmartPropertyObjectDto[] = _.reduce(objects, (result, obj) => {
                const propsSmartObject: SmartPropertyObjectDto[] = _.filter(
                    obj.properties,
                    (p: SmartPropertyObjectDto) => p.key === key
                );
                if (propsSmartObject.length !== 0) {
                    result.push(...propsSmartObject)
                }
                return result;
            }, []);

            if (props.length !== 0) {
                const propModel: SmartPropertyModelDto =
                    _.find(smartModel.properties, (prp: SmartPropertyModelDto) => prp.key === props[0].key);

                const filterValues: string[] = _.map(props, (pr: SmartPropertyObjectDto) => pr.value);
                const criteria = {
                    key,
                    value: {
                        criteria: 'equal',
                        value: (filterValues.length > 1) ? filterValues : filterValues[0],
                        type: (propModel) ? propModel.keyType : 'string',
                    }
                }
                result.push(criteria);
            }
            return result;
        }, []));
    }

    /* Only for tests */
    _pushObject(smartObjects: SmartObjectDto[], propToMerge: string[], toMerge: SmartObjectDto, smartModel: SmartModelDto, properties: SmartPropertyObjectDto[]): SmartObjectDto {

        for (const prop of smartModel.properties) {
            if (propToMerge.length === 0 || (propToMerge.length !== 0 && propToMerge.includes(prop.key))) {
                const p = _.find(properties, { key: prop.key });
                const value = p && p.value ? p.value : undefined;
                if (this.soUtils.propertyIsValid(prop, value)) {
                    this.soUtils.setPropertyValue(toMerge, smartModel, prop.key, value, true);
                }
            }
        }
        smartObjects.push(toMerge);
        return toMerge;
    }

    private _getTransitionData(idx: number): { key: string, type: string } {
        if (this._task.transitions.length === 0 ||
            this._task.transitions[0].data.length <= idx ||
            !this._task.transitions[0].data[idx].key ||
            !this._task.transitions[0].data[idx].type) {
            throw new TaskMergeError('ERR-046', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: this._task.transitions[0].data[idx].key,
            type: this._task.transitions[0].data[idx].type
        };
    }
}
