import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { TaskInputCaptureDto } from '../../../../dto/task-input-capture.dto';
import { zip, of } from 'rxjs';
import { TaskInputCaptureError } from '../../../../container-error/container-error';
import { WorkflowUtilsService } from '../../../../../workflow-interpretor/workflow-utils/workflow-utils.service';

import * as _ from 'lodash';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TranslateService } from '@ngx-translate/core';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


@Component({
    template: `
        <div class="wf-padding">
            <at-so-input
                (keyup)="validateInput()"
                (enter)="validateInput(true)"
                [placeholder]="entryField"
                [autoFocus]="true"
                [(value)]="inputValue">
            </at-so-input>
        </div>
    `
})
export class TaskInputCaptureComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    inputValue = '';
    entryField = '';
    buttonText = '';

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskInputCaptureDto;
        zip(
            customData.entryField ? customData.entryField() : of(''),
            customData.buttonText ? customData.buttonText() : of(''),
        ).
            subscribe((values: any[]) => {
                this.entryField = values[0];
                this.buttonText = (values[1] === '') ?
                    this.translateService.instant('WORKFLOW.TASK.INPUT-CAPTURE.VERIFIER') : values[1];
                this.onLoad();
            }, (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-063', err, TaskInputCaptureError));
            });
    }

    constructor(
        private workflowUtilsService: WorkflowUtilsService,
        private translateService: TranslateService,
        private taskUtils: TaskUtilsService
    ) { }

    onLoad() {
        const actions = _.map(
            this.workflowUtilsService.getActiveTask(this._task.instance).operations.filter((op) => op.type === 'action'),
            ((operation) => operation.value)
        );
    }

    validateInput(forceValidate = false) {
        const transfs: InterpretorTransferTransitionDto[] = [];
        transfs.push(this.transferConstruction(this.inputValue, this._task));

        const wInterpretor: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transfs
        };

        if (forceValidate) {
            this.validate.emit(wInterpretor);
        } else {
            this.partialValidate.emit({ validation: wInterpretor, authorizationToNext: true });
        }
    }

    transferConstruction(returnedQRCode, task: InterpretorTaskDto): InterpretorTransferTransitionDto {
        return {
            saveOnApi: true,
            data: this._getTransitionData(task),
            type: 'sysobjects',
            value: returnedQRCode
        };
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskInputCaptureError('ERR-064', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

}
