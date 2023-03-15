import { Observable, zip, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto } from '../dto';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { TaskRequestResultError } from '../error/tasks-error';
import { SmartObjectDto } from '@algotech/core';
import { TaskRequestResultDto } from '../dto/tasks/task-request-result.dto';

export class TaskRequestResult extends TaskBase {

    _task: InterpretorTaskDto;

    saveOnApi = false;
    objectIsArray = false;

    typeRequest: string;
    code: number;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskRequestResultDto);
        this._task = task;
        return zip(
            customData.inputs ? customData.inputs({ formatted: true}) : of(null),
            customData.format ? customData.format() : of(''),
            customData.code ? customData.code() : of(200),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-056', err, TaskRequestResultError);
            }),
            mergeMap((values: any[]) => {
                const inputs: any[] = _.isArray(values[0]) ? values[0] : [values[0]];
                this.typeRequest = (inputs[0] instanceof SmartObjectDto) ? values[1] : 'object';
                this.code = values[2];
                this.objectIsArray = _.isArray(values[0]);
                return this.loadTransfers(inputs);
            }),
            map((res: any) => {
                const transfers: InterpretorTransferTransitionDto[] = _.compact([
                    this._loadSOTransfer(res),
                    this._loadStatusTransfer(this.code)
                ]);

                return this._computevalidation(transfers);
            }),
        );
    }

    loadTransfers(datas: any): Observable<any> {

        if (datas[0] instanceof SmartObjectDto) {
            if (this.typeRequest === 'smartObject') {
                return (this.objectIsArray) ? of(datas) : of(datas[0]);
            } else {
                return this._validateJsonFile(datas);
            }
        } else {
            return (this.objectIsArray) ? of(datas) : of(datas[0]);
        }
    }

    _validateJsonFile(smartobjects: SmartObjectDto[]): Observable<any[]> {

        return this._getSo(smartobjects).pipe(
            map((sos: SmartObjectDto[][]) => {

                const objs = _.concat(...sos);
                const allSmartObjects = [...this._task.instance.smartobjects, ...smartobjects, ...objs];
                const returnJson = this.soUtils.buildJson(smartobjects, allSmartObjects, this._task.instance.context.smartmodels,
                    this._task.instance.context.custom.indexes);
                return (this.objectIsArray) ? returnJson : (returnJson.length > 0 ? returnJson[0] : null);
            })
        );
    }

    _getSo(smartobjects: SmartObjectDto[]): Observable<any> {

        const download$: Observable<SmartObjectDto>[] = _.reduce(smartobjects, (result: any[], so: SmartObjectDto) => {
            const findIndex = _.findIndex(this._task.instance.smartobjects, (findSo: SmartObjectDto) => findSo.uuid === so.uuid);
            if (findIndex === -1) {
                const objs = this.soUtils.getSubDoc(so.uuid, this._task.instance.context).pipe(catchError(() => of([])));
                result.push(objs);
            }
            return result;
        }, []);
        return (download$.length === 0) ? of([]) : zip(...download$);
    }

    _loadSOTransfer(dataTransfer: any): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            data: this._getTransitionData(),
            saveOnApi: this.saveOnApi,
            type: (this.typeRequest === 'smartObject') ? 'smartobjects' : 'sysobjects',
            value: dataTransfer,
        };
        return transfer;
    }

    _loadStatusTransfer(code: number): InterpretorTransferTransitionDto {
        const data = this._getTransitionData(1);
        if (!data) {
            return null;
        }
        const transfer: InterpretorTransferTransitionDto = {
            data,
            saveOnApi: false,
            type: 'sysobjects',
            value: code,
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

    private _getTransitionData(index = 0): { key: string, type: string } {
        if (!this._task ||
            this._task.transitions.length === 0 ||
            this._task.transitions[0].data.length <= index ||
            !this._task.transitions[0].data[index].key ||
            !this._task.transitions[0].data[index].type) {
            return null;
        }
        return {
            key: this._task.transitions[0].data[index].key,
            type: this._task.transitions[0].data[index].type
        };
    }
}
