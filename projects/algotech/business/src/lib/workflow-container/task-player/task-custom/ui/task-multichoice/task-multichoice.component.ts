import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TasKMultiChoices } from '../../../../dto/task-multi-choices.dto';
import { TaskMultiChoiceError } from '../../../../container-error/container-error';
import { of, zip } from 'rxjs';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


@Component({
    template: `
    <div class="wf-padding">
        <div class="description" *ngIf="description !== null && description !== undefined && description !== ''">{{ description }}</div>
        <at-task-transitions [transitions]="_task.transitions" (validate)="_validate($event)"></at-task-transitions>
    </div>
  `,
    styleUrls: ['./task-multichoice.component.scss']
})
export class TaskMultichoiceComponent implements TaskComponent {
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    _task: InterpretorTaskDto;
    description: string = null;

    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;

        const customData = this._task.custom as TasKMultiChoices;

        zip(
            customData.description ? customData.description() : of(''),
        ).subscribe(
            ((res: any[]) => {
                this.description = res[0] && res[0] !== '' ? res[0] : null;
            }), (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-065', err, TaskMultiChoiceError));
            });

    }

    constructor(private taskUtils: TaskUtilsService) { }

    _validate(transitionKey: string) {
        // Out
        const validation: InterpretorValidateDto = {
            transitionKey,
            transfers: [],
        };

        this.validate.emit(validation);
    }

}
