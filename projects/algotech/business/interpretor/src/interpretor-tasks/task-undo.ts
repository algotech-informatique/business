import { Observable, of } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorJumpDto, InterpretorTypeJump } from '../dto';

export class TaskUndo extends TaskBase {

    execute(task: InterpretorTaskDto):
        Observable<InterpretorValidateDto | InterpretorJumpDto> {

        // find taskModel
        const findTaskModel = task.transitions.find((t) => t.key === 'done').task;
        const findTask = this.interpretorUtils.stackTasksReduce(task.instance).find((t) => t.taskModel === findTaskModel);

        if (findTask) {
            const jump = new InterpretorJumpDto();
            jump.direction = InterpretorTypeJump.Jump;
            jump.options = {
                force: true,
                reverse: true,
            }
            jump.uuid = findTask.uuid;

            return of(jump);
        } else {
            const validate: InterpretorValidateDto = {
                transitionKey: 'done',
                transfers: [],
            };
            return of(validate);
        }
    }
}
