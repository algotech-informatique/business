import { Component, Input, ViewEncapsulation, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { LangDto } from '@algotech-ce/core';
import { InterpretorTaskDto } from '../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../interpretor/src/dto';
import { NgComponentError } from '../../../../interpretor/src/error/tasks-error';
import { DataService } from '@algotech-ce/angular';

@Component({
    selector: 'at-task-player',
    styleUrls: ['./task-player.style.scss'],
    template: `
        <div id="task" class="task-container" *ngIf="task" [style.--KEYBOARD-HEIGHT]="keyboardHeight + 'px'">
            <at-task-header
                id="at-task-header"
                [workflowName]="workflowName"
                [task]="task"
                (closed)="onClose()">
            </at-task-header>

            <at-task-custom
                id="at-task-custom"
                [task]="task"
                (validate)="taskValidate($event)"
                (partialValidate)="taskPartialValidate($event)"
                (handleError)="taskHandleError($event)"
                (showToast)="toast($event)"> </at-task-custom>

            <at-task-paginate
                id="at-task-paginate"
                (nextTask)="nextPaginateTask($event)"
                (previousTask)="previousPaginateTask($event)"
                [showNext]="showNext"
                [task]="task">
            </at-task-paginate>
        </div>
   `,
    encapsulation: ViewEncapsulation.None
})

export class TaskPlayerComponent implements OnChanges, OnInit {
    @Input() workflowName: LangDto[];
    @Input() task: InterpretorTaskDto;
    @Input() stepNumber: number;
    @Input() currentStep: number;
    @Input() showNext: boolean;

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() handleError = new EventEmitter();
    @Output() nextTask = new EventEmitter();
    @Output() previousTask = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() closed = new EventEmitter();

    keyboardHeight = 0;

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        if (this.dataService.mobile && 'visualViewport' in window) {
            const VIEWPORT_VS_CLIENT_HEIGHT_RATIO = 0.75;
            window.visualViewport.addEventListener('resize', (event) => {
                if (
                    ((event.target as any).height * (event.target as any).scale) / window.screen.height <
                    VIEWPORT_VS_CLIENT_HEIGHT_RATIO
                ) {
                    this.keyboardHeight = document.body.scrollHeight - (
                        (event.target as any).height * (event.target as any).scale
                    );
                } else {
                    this.keyboardHeight = 0;
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.task) {
        }
    }

    taskValidate(validateDto: InterpretorValidateDto) {
        this.validate.emit(validateDto);
    }
    taskPartialValidate(validateDto: InterpretorValidateDto) {
        this.partialValidate.emit(validateDto);
    }
    taskHandleError(error: NgComponentError) {
        this.handleError.emit(error);
    }
    nextPaginateTask(action) {
        // simply forward event
        this.nextTask.emit(action);
    }
    previousPaginateTask(action) {
        // simply forward event
        this.previousTask.emit(action);
    }
    onClose() {
        this.closed.emit();
    }
    toast(message) {
        this.showToast.emit(message);
    }
}
