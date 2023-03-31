import { zip, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SmartObjectDto, SmartModelDto, SmartPropertyObjectDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, TaskObjectFilterDto } from '../dto';
import { TaskObjectFilterError } from '../error/tasks-error';

export class TaskObjectFilter extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskObjectFilterError('ERR-019', '{{TASK-PARAMETERS-CORRUPTED}}');
        }

        const customData = (task.custom as TaskObjectFilterDto);
        return zip(
            customData.objects(),
            customData.smartModel(),
            customData.filterProperty ? customData.filterProperty() : of(''),
            customData.filterValue ? customData.filterValue() : of('')
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-020', err, TaskObjectFilterError);
            }),
            map((values: any[]) => {
                const smartObjects: SmartObjectDto[] = values[0];
                const smartModel: SmartModelDto = values[1];
                const property: string = values[2];
                const filterValue: string = values[3];

                const filteredSO: SmartObjectDto[] = this._filterSmartObject(smartObjects, smartModel.key);
                const totalSO: SmartObjectDto[] = (filterValue !== '')
                    ? this._filterSmartObjectProperty(filteredSO, property, filterValue) : filteredSO;

                return this._computevalidation(totalSO, task);
            })
        );
    }

    _filterSmartObject(smartObjects: SmartObjectDto[], model: string): SmartObjectDto[] {
        return _.filter(smartObjects, (so: SmartObjectDto) => so.modelKey === model);
    }

    _filterSmartObjectProperty(smartObjects: SmartObjectDto[], property: string, filterValue: string): SmartObjectDto[] {
        return _.filter(smartObjects, (so: SmartObjectDto) => {
            return _.find(so.properties, (sop: SmartPropertyObjectDto) =>
                sop.key.toUpperCase() === property.toUpperCase() && sop.value && filterValue &&
                sop.value.toUpperCase() === filterValue.toUpperCase()
            ) !== undefined;
        });
    }

    _computevalidation(smartObjects: SmartObjectDto[], task: InterpretorTaskDto): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [
                {
                    saveOnApi: false,
                    data: {
                        key: task.transitions[0].data[0].key,
                        type: task.transitions[0].data[0].type
                    },
                    type: 'smartobjects',
                    value: smartObjects
                }
            ]
        };
        return validation;
    }
}
