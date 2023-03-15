import { Observable, zip, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, TaskMergeDto } from '../dto';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { TaskMergeError } from '../error/tasks-error';
import { SmartModelDto, SmartObjectDto, SmartPropertyObjectDto, SmartPropertyModelDto, WorkflowInstanceDto } from '@algotech/core';

export class TaskMerge extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskMergeDto);
        return zip(
            customData.smartModel(),
            customData.array(),
            customData.propType(),
            customData.saveOnApi ? customData.saveOnApi() : of(true)
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-047', err, TaskMergeError);
            }),
            mergeMap((values: any[]) => {

                const smartModel: SmartModelDto = values[0];
                const objects: SmartObjectDto[] = values[1];
                const propType: string[] = values[2];
                const saveOnApi = values[3];
                return this.soUtils.getAllByModel(smartModel.key, task.instance.context).pipe(
                    catchError((err) => {
                        throw new TaskMergeError('ERR-048', `{{FAILED-TO-FETCH-DATA-BY-MODEL}} : ${err.message}`);
                    }),
                    map((smartObjects: SmartObjectDto[]) => {
                        for (const smartObject of smartObjects) {
                            if (!task.instance.smartobjects.some((so) => so.uuid === smartObject.uuid)) {
                                task.instance.smartobjects.push(smartObject);
                            }
                        }
                        return {
                            smartModel,
                            smartObjects,
                            objects,
                            propType,
                            saveOnApi
                        }
                    })
                )
            }),
            map((data: { smartModel: SmartModelDto, smartObjects: SmartObjectDto[], objects: SmartObjectDto[], propType: string[], saveOnApi }) => {

                let dbObjects: SmartObjectDto[] = _.cloneDeep(data.smartObjects);
                const so2Add: SmartObjectDto[] = [];
                for (let object of data.objects) {

                    const propsObject: SmartPropertyObjectDto[] = _.filter(object.properties, (p: SmartPropertyObjectDto) => data.propType.includes(p.key));
                    if (propsObject.length !== data.propType.length) {
                        continue;
                    }

                    const smartObject: SmartObjectDto = _.find(dbObjects, (so: SmartObjectDto) => {

                        const propsSmartObject: SmartPropertyObjectDto[] = _.filter(
                            so.properties,
                            (p: SmartPropertyObjectDto) => data.propType.includes(p.key)
                        );
                        return this.isEqual(propsObject, propsSmartObject);
                    })
                    if (smartObject) {

                        // merge data from model
                        _.map(data.smartModel.properties, (pm: SmartPropertyModelDto) => {
                            const propObject = _.find(object.properties, { key: pm.key });
                            if (propObject) {
                                const propSmartObject = _.find(smartObject.properties, { key: pm.key });
                                if (!this.soUtils.propertyIsValid(pm, propObject.value)) {
                                    console.error(`Value (${pm.key}) not valid: expected(${pm.keyType}) received(${propObject.value})`);
                                }
                                if (propSmartObject && this.soUtils.propertyIsValid(pm, propObject.value)) {
                                    propSmartObject.value = propObject.value;
                                }
                            }
                        });

                    } else {
                        if (!this.pushObject(so2Add, data.smartModel, object.properties)) {
                            console.error('Property(ies) NOT Valid', object);
                        }
                    }
                }
                dbObjects.push(...so2Add);
                this._transform(data.saveOnApi, dbObjects, task.instance);

                const result: InterpretorValidateDto = {
                    transitionKey: 'done',
                    transfers: [{
                        saveOnApi: data.saveOnApi,
                        type: 'smartobjects',
                        value: dbObjects,
                        data: this._getTransitionData(task),
                    }]
                };
                return result;
            })
        );
    }

    _transform(saveOnApi: boolean, smartObjects: SmartObjectDto[], instance: WorkflowInstanceDto) {
        if (saveOnApi) {
            return;
        }

        for (const smartObject of smartObjects) {
            if (!instance.smartobjects.some((so) => so.uuid === smartObject.uuid && !so.local)) { // not exist
                Object.assign(smartObject, { local: true });
            }
        }
    }

    private pushObject(smartObjects: SmartObjectDto[], smartModel: SmartModelDto, properties: SmartPropertyObjectDto[]): string {
        const soObject: SmartObjectDto = this.soUtils.createInstance(smartModel);

        for (const prop of smartModel.properties) {
            const p = _.find(properties, { key: prop.key });
            const value = p && p.value ? p.value : undefined;
            if (this.soUtils.propertyIsValid(prop, value)) {
                this.soUtils.setPropertyValue(soObject, smartModel, prop.key, value, true);
            }
            else {
                return;
            }
        }
        smartObjects.push(soObject);
        return soObject.uuid;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskMergeError('ERR-049', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    private isEqual(value, other) {

        // Get the value type
        var type = Object.prototype.toString.call(value);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;


        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (this.compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (this.compare(value[key], other[key]) === false) return false;
                }
            }
        }

        // If nothing failed, return true
        return true;

    };

    // Compare two items
    private compare(item1, item2) {

        // Get the object type
        var itemType = Object.prototype.toString.call(item1);

        // If an object or array, compare recursively
        if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
            if (!this.isEqual(item1, item2)) return false;
        }

        // Otherwise, do a simple comparison
        else {

            // If the two items are not the same type, return false
            if (itemType !== Object.prototype.toString.call(item2)) return false;

            // Else if it's a function, convert to a string and compare
            // Otherwise, just compare
            if (itemType === '[object Function]') {
                if (item1.toString() !== item2.toString()) return false;
            } else {
                if (item1 !== item2) return false;
            }

        }
    };

}
