import { Observable, zip } from 'rxjs';
import { ScheduleDto } from '@algotech/core';
import * as _ from 'lodash';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, InterpretorTransferTransitionDto, TaskScheduleDeleteDto } from '../dto';
import { TaskScheduleDeleteError } from '../error/tasks-error';

export class TaskScheduleDelete extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskScheduleDeleteDto);
        return zip(
            customData.schedules(),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-005', err, TaskScheduleDeleteError);
            }),
            map((values: any[]) => {
                const schedules: ScheduleDto[] = (_.isArray(values[0])) ? values[0] : [values[0]];
                const validation: InterpretorValidateDto = {
                    transitionKey: 'done',
                    transfers: _.map(_.compact(schedules), (schedule: ScheduleDto) => {
                        const transfer: InterpretorTransferTransitionDto = {
                            saveOnApi: true,
                            type: 'action',
                            value: {
                                actionKey: 'delete-schedule',
                                value: schedule.uuid,
                            }
                        };
                        return transfer;
                    }),
                };
                return validation;
            })
        );
    }
}
