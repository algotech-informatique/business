import { zip, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, TaskSwitchDto } from '../dto';
import { TaskSwitchError } from '../error/tasks-error';
import * as _ from 'lodash';
import { PairDto } from '@algotech-ce/core';

export class TaskSwitch extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskSwitchDto);
        return zip(
            customData.switchAValue({ formatted: true}),
            customData.criterias({ formatted: true}),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-059', err, TaskSwitchError);
            }),
            map((values: any[]) => {
                const switchAValue = values[0];
                const criterias = values[1];
                return {
                    transitionKey: this.validateSwitch(switchAValue, criterias),
                    transfers: []
                };

            })
        );
    }

    private validateSwitch(switchAValue: any, criterias: PairDto[]) {
        const find: PairDto = criterias.find((criteria: PairDto) => criteria.value.toString() === switchAValue.toString());
        return (find) ? find.key : 'default';
    }
}
