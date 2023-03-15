import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskTransitionModelDto } from '@algotech/core';


@Component({
    selector: 'at-task-transitions',
    template: `
        <div class="content">
            <div class="at-button">
                <button class="outline" *ngFor="let transition of transitions" (click)="onValidate(transition.key)">
                    {{transition.displayName | tlang}}
                </button>
            </div>
        </div>
  `,
  styleUrls: ['./task.transitions.component.scss']
})
export class TaskTransitionsComponent {

    @Input() transitions: TaskTransitionModelDto[] = [];
    @Output() validate = new EventEmitter<string>();

    onValidate(transitionKey: string) {
        this.validate.emit(transitionKey);
    }
}
