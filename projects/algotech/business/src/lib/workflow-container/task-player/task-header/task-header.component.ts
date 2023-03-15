import { DataService, TranslateLangDtoService } from '@algotech/angular';
import { LangDto } from '@algotech/core';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { InterpretorTaskDto } from '../../../../../interpretor/src';
import { WorkflowUtilsService } from '../../../workflow-interpretor/workflow-utils/workflow-utils.service';

@Component({
    selector: 'at-task-header',
    styleUrls: ['./task-header.component.scss'],
    template: `
            <div class="header">
                <i class="fa-solid fa-sign-out-alt leave" (click)="onClose()" *ngIf="dataService.mobile"></i>
                <div class="text">
                    <div class="workflowName">{{ workflowName | tlang}}</div>
                    <div class="taskName">{{ taskName }}</div>
                </div>
            </div>
  `,
})
export class TaskHeaderComponent implements OnChanges {
    @Input() workflowName: LangDto[];
    @Input() task: InterpretorTaskDto;
    @Output() closed = new EventEmitter();

    taskName: string;

    constructor(
        public dataService: DataService,
        private worklowUtilsService: WorkflowUtilsService,
        private translate: TranslateLangDtoService,
        private ref: ChangeDetectorRef) {}

    ngOnChanges() {
        const exclude = ['TaskNotification'];
        this.taskName = this.translate.transform(this.worklowUtilsService.getActiveTaskModel(this.task.instance).general.displayName);
        if (!exclude.includes(this.task.type) && this.task.custom.title) {
            this.task.custom.title().subscribe((title: string) => {
                if (title) {
                    this.taskName = title;
                    this.ref.detectChanges();
                }
            });
        }
        this.ref.detectChanges();
    }

    onClose() {
        this.closed.emit();
    }
}
