import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TaskPaginateError } from '../../container-error/container-error';
import * as _ from 'lodash';
import { WorkflowUtilsService } from '../../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { InterpretorTaskDto } from '../../../../../interpretor/src/dto';
import { TranslateLangDtoService } from '@algotech/angular';

@Component({
    selector: 'at-task-paginate',
    styleUrls: ['./task-paginate.style.scss'],
    template: `
    <div class="detail" *ngIf="loaded">
        <i class="fa-solid fa-chevron-left button left"
            [ngClass]="{
                'disabled': !_showPrevious
            }"
            (click)="onPrevious()">
        </i>

        <div class="pagination">
            <span class="page">{{_currentTaskIndex + 1}} / {{_totalTasks}}</span>
            <span class="stepName">{{ _stepName }}</span>
        </div>

        <span *ngIf="_trName" class="button text right" (click)="onNext()" [ngClass]="{
                'disabled': !showNext
        }" [title]="_trName">{{_trName}}</span>
        <i *ngIf="!_trName" [class]="(_isLastTask ? 'fa-solid fa-flag-checkered' : 'fa-solid fa-chevron-right') + ' button right'"
            [ngClass]="{
                'disabled': !showNext
            }"
            (click)="onNext()">
        </i>
    </div>
  `,
})
export class TaskPaginateComponent implements OnChanges {

    @Input() task: InterpretorTaskDto;
    @Input() showNext: boolean;
    @Output() nextTask = new EventEmitter();
    @Output() previousTask = new EventEmitter();

    public _currentTaskIndex = -1;

    loaded = false;
    public _isLastTask = false;
    public _totalTasks = 0;
    public _showPrevious = true;
    public _trName = '';
    public _stepName = '';

    constructor(
            private wUtilsService: WorkflowUtilsService,
            private translateLang: TranslateLangDtoService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes && changes.task) {
            const task: InterpretorTaskDto = changes.task.currentValue as InterpretorTaskDto;
            this.loadTask(task);
        }

    }

    loadTask(task: InterpretorTaskDto) {
        if (task && task.taskBreadCrumb) {
            this.loaded = false;

            this._totalTasks = task.taskBreadCrumb.length;
            this._showPrevious = this.wUtilsService.canPrevious(this.task.instance);
            this._isLastTask = this.wUtilsService.isLastTask(this.task.instance);
            this._stepName = this.translateLang.transform(this.wUtilsService.getActiveStep(task.instance).displayName, null, false);
            this._stepName = this._stepName ? this._stepName : '-';
            this._currentTaskIndex = _.findIndex(task.taskBreadCrumb, { active: true });
            this._trName = '';

            if (!this._isLastTask) {
                const activetask = this.wUtilsService.getActiveTaskModel(this.task.instance);
                if (activetask) {
                    const trDone = activetask.properties.transitions.find((t) => t.key === 'done');
                    if (trDone && trDone.displayName && trDone.displayName.length > 0) {
                        this._trName = this.translateLang.transform(trDone.displayName);
                    }
                }
            }

            this.loaded = true;

        } else {
            throw new TaskPaginateError('ERR-060', '{{NO-INPUT-TASK-PROVIDED}}');
        }
    }
    onPrevious() {
        this.previousTask.emit();
    }
    onNext() {
        this.nextTask.emit();
    }
}
