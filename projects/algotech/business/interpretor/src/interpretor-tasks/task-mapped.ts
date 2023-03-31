import { Observable, zip, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto } from '../dto';
import { TaskMappedDto } from '../dto/tasks/task-mapped.dto';
import { map, catchError } from 'rxjs/operators';
import { TaskMappedError } from '../error/tasks-error';
import { SmartModelDto, SmartObjectDto, PairDto, SmartPropertyModelDto, WorkflowInstanceDto } from '@algotech-ce/core';

export class TaskMapped extends TaskBase {

    saveOnApi = true;
    objectIsArray = false;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskMappedDto);
        return zip(
            customData.object ? customData.object() : of(null),
            customData.smartModel(),
            customData.autoMapped ? customData.autoMapped() : of(true),
            customData.fields ? customData.fields() : of([]),
            customData.saveOnApi ? customData.saveOnApi() : of(true)
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-042', err, TaskMappedError);
            }),
            map((values: any[]) => {
                const objects: any[] = _.isArray(values[0]) ? values[0] : [values[0]];
                const smartModel: SmartModelDto = values[1];
                const autoMapped: boolean = values[2];
                const mappedFields: PairDto[] = values[3];
                this.objectIsArray = _.isArray(values[0]);
                this.saveOnApi = values[4];

                const smartObjects: SmartObjectDto[] = [];
                const uuids: string[] = (autoMapped) ?
                    _.map(objects, (object) => {
                        return this.soUtils.smartObjectMapped(smartModel, task.instance.context.smartmodels, object, smartObjects).uuid;
                    }) :
                    _.map(objects, (object) => {
                        this.objectMappedFields(smartObjects, smartModel, task.instance.context.smartmodels, mappedFields, object);
                    });

                return this.loadTransfers(smartObjects, uuids, task);
            })
        );
    }

    private objectMappedFields(smartObjects: SmartObjectDto[], smartModel: SmartModelDto, smartModels: SmartModelDto[],
        mappedFields: PairDto[], object: any[]): string {

        const soObject: SmartObjectDto = this.soUtils.createInstance(smartModel);

        const _object = {};
        Object.entries(object).forEach(([key, value]) => {
            _object[key.toUpperCase()] = value;
        });

        for (const mappedField of mappedFields) {
            const value = _object.hasOwnProperty(mappedField.value.toUpperCase()) ? _object[mappedField.value.toUpperCase()] : null;
            const prop: SmartPropertyModelDto = _.find(smartModel.properties, (pr: SmartPropertyModelDto) => pr.key === mappedField.value);
            if (prop) {
                this.soUtils.smartObjectMappedProperty(soObject, smartModel, prop, smartModels, value, smartObjects);
            }
        }
        smartObjects.push(soObject);
        return soObject.uuid;
    }


    loadTransfers(smartObjects: SmartObjectDto[], uuids: string[], task: InterpretorTaskDto): InterpretorValidateDto {

        const smObj1: SmartObjectDto[] = _.reduce(uuids, (result, uuid) => {
            const findIndex = _.findIndex(smartObjects, (so: SmartObjectDto) => uuid === so.uuid);
            if (findIndex !== -1) {
                result.push(smartObjects[findIndex]);
            }
            return result;
        }, []);
        const smObj2: SmartObjectDto[] = [];
        for (const smo of smartObjects) {
            const findIndex = _.findIndex(smObj1, (so: SmartObjectDto) => smo.uuid === so.uuid);
            if (findIndex === -1) {
                smObj2.push(smo);
            }
        }

        const transfers: InterpretorTransferTransitionDto[] = [];
        this._transform(smObj1, task.instance);
        this._transform(smObj2, task.instance);
        transfers.push(this._loadSOTransfer(smObj1, task));
        if (smObj2.length !== 0) {
            transfers.push(this._loadSOTransferSecondary(smObj2, task));
        }
        return this._computevalidation(transfers);
    }

    _transform(smartObjects: SmartObjectDto[], instance: WorkflowInstanceDto) {
        if (this.saveOnApi) {
            return;
        }

        for (const smartObject of smartObjects) {
            if (!instance.smartobjects.some((so) => so.uuid === smartObject.uuid && !so.local)) { // not exist
                Object.assign(smartObject, { local: true });
            }
        }
    }

    _loadSOTransfer(smartObjects: SmartObjectDto[], task: InterpretorTaskDto): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            data: this._getTransitionData(task),
            saveOnApi: this.saveOnApi,
            type: 'smartobjects',
            value: this.objectIsArray ? smartObjects : smartObjects[0]
        };
        return transfer;
    }

    _loadSOTransferSecondary(smartObjects: SmartObjectDto[], task: InterpretorTaskDto): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: this.saveOnApi,
            type: 'smartobjects',
            value: smartObjects
        };
        return transfer;
    }

    _computevalidation(transfers: InterpretorTransferTransitionDto[]): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers
        };
        return validation;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskMappedError('ERR-043', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
