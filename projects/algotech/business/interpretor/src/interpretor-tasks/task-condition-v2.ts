import { zip, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, TaskConditionV2Dto } from '../dto';
import { TaskConditionV2Error } from '../error/tasks-error';
import { PairDto } from '@algotech-ce/core';
import * as _ from 'lodash';

export class TaskConditionV2 extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskConditionV2Dto);
        return zip(
            customData.conditionAValue({ formatted: true }),
            customData.criterias({ formatted: true }),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-002', err, TaskConditionV2Error);
            }),
            map((values: any[]) => {
                const conditionAValue = values[0];
                const criterias = values[1];
                return {
                    transitionKey: this.validateCondition(conditionAValue, criterias) ? 'true' : 'false',
                    transfers: []
                };

            })
        );
    }

    private validateCondition(conditionAValue: any, criterias: PairDto[]) {
        return criterias.every(criteria => {
            switch (criteria.value.criteria) {
                case 'startsWith':
                    return conditionAValue.startsWith(criteria.value.value);
                case 'notStartsWith':
                    return !conditionAValue.startsWith(criteria.value.value);
                case 'endWith':
                    return conditionAValue.endsWith(criteria.value.value);
                case 'contains':
                    return conditionAValue.includes(criteria.value.value);
                case 'gt':
                    return conditionAValue > criteria.value.value;
                case 'lt':
                    return conditionAValue < criteria.value.value;
                case 'gte':
                    return conditionAValue >= criteria.value.value;
                case 'lte':
                    return conditionAValue <= criteria.value.value;
                case 'between':
                    const min = criteria.value.value < criteria.value.secondValue ? criteria.value.value : criteria.value.secondValue;
                    const max = criteria.value.value > criteria.value.secondValue ? criteria.value.value : criteria.value.secondValue;
                    return min <= conditionAValue && conditionAValue <= max;
                case 'equals':
                    return _.isEqual(conditionAValue, criteria.value.value);
                case 'different':
                    return !_.isEqual(conditionAValue, criteria.value.value);
                case 'isNull':
                    return conditionAValue == null || conditionAValue.length === 0;
                case 'isNotNull':
                    return (conditionAValue != null) && (!Array.isArray(conditionAValue) || conditionAValue?.length > 0);        
                case 'exists':
                    return (conditionAValue != null) && (!Array.isArray(conditionAValue) || conditionAValue?.length > 0);
                case 'in':
                    const checkArray = Array.isArray(conditionAValue) ? conditionAValue : [conditionAValue];
                    return checkArray.some((value: any) => criteria.value.value.includes(value));
                default:
                    return false;
            }
        });
    }

}
