import { NotificationDto } from '@algotech-ce/core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'notification-card',
    templateUrl: './notification-card.component.html',
    styleUrls: ['./notification-card.component.scss'],
    animations: [
        trigger('openClose', [
            // ...
            state('open', style({
                height: '*',
            })),
            state('closed', style({
                height: '0px',
            })),
            transition('open => closed', [
                animate('0.20s')
            ]),
            transition('closed => open', [
                animate('0.20s')
            ]),
        ]),
    ],
})
export class NotificationCardComponent {

    @Input() notification: NotificationDto;
    @Input() login;

    @Output() selected = new EventEmitter();
    @Output() continue = new EventEmitter();

    isCollapsed = false;

    constructor() {
    }

    onCollapseContent(event) {
        this.isCollapsed = !this.isCollapsed;
        event.stopPropagation();
        this.selected.emit();
    }

    onContinue(event) {
        this.continue.emit(event);
    }
}
