import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';

@Component({
  template: `
    <b>TaskAlert</b>
  `
})
export class TaskAlertComponent implements TaskComponent {
  @Input() task: InterpretorTaskDto;
  @Output() validate = new EventEmitter();
  @Output() partialValidate = new EventEmitter();
  @Output() showToast = new EventEmitter();
  @Output() handleError = new EventEmitter<NgComponentError>();
}
