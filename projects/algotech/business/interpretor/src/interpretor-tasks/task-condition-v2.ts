import { zip, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, TaskConditionV2Dto } from '../dto';
import { TaskConditionV2Error } from '../error/tasks-error';
import { PairDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { InterpretorCondition } from '../interpretor-reader/interpretor-task/interpretor-condition';

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
        return InterpretorCondition.validate(conditionAValue, criterias.map((c) => c.value));
    }
}
