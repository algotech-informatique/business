import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorJumpDto } from '../dto';

export class TaskLockGoBack extends TaskBase {

    execute(task: InterpretorTaskDto):
        Observable<InterpretorValidateDto | InterpretorJumpDto> {

        const validate: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [],
        };
        return of(validate);
    }
}
