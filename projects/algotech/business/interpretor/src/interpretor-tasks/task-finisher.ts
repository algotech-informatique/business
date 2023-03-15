import { Observable, zip, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, TaskFinisherDto, InterpretorFinisherDto } from '../dto';
import { TaskFinisherError } from '../error/tasks-error';

export class TaskFinisher extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorFinisherDto> {
        const customData = (task.custom as TaskFinisherDto);
        return zip(
            customData.save ? customData.save() : of(InterpretorFinisherDto.DEFAULT_SAVE),
            customData.displayMode ? customData.displayMode() : of(InterpretorFinisherDto.DEFAULT_DISPLAY_MODE),
            customData.timeout ? customData.timeout() : of(InterpretorFinisherDto.DEFAULT_TIMEOUT),
            customData.message ? customData.message() : of(InterpretorFinisherDto.DEFAULT_MESSAGE),
            customData.outputTrigger ? customData.outputTrigger() : of(InterpretorFinisherDto.DEFAULT_OUTPUT_TRIGGER),
            customData.type ? customData.type() : of(InterpretorFinisherDto.DEFAULT_TYPE),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-151', err, TaskFinisherError);
            }),
            map((values: any[]) => {
                const finisher: InterpretorFinisherDto = new InterpretorFinisherDto(task.instance);

                finisher.save = values[0];
                finisher.displayMode = values[1];
                finisher.timeout = values[2];
                finisher.message = values[3];
                finisher.outputTrigger = values[4];
                finisher.type = values[5];

                return finisher;
            })
        );
    }
}
