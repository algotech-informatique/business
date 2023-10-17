import { catchError, defer, delay, map, mergeMap, Observable, of, tap, zip } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, TaskSleepDto } from '../dto';
import { TaskSleepError } from '../error/tasks-error';

export class TaskSleep extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        var due = 1000;
        const customData = (task.custom as TaskSleepDto);
        return zip(
            customData.due ? customData.due() : of(1000),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-056', err, TaskSleepError);
            }),
            mergeMap((res: any) => {
                due = res[0]; 
                return of(this.taskUtils.computevalidation([])).pipe(
                    delay(due),
                )
            }),
        );
    }
}
