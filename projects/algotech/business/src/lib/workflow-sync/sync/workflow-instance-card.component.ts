import { Component, Input } from '@angular/core';
import moment from 'moment';
import { CardSubElement } from './card-sub-element.interface';


@Component({
    selector: 'workflow-instance-card',
    templateUrl: './workflow-instance-card.component.html',
    styleUrls: ['./workflow-instance-card.component.scss'],
})

export class WorkflowInstanceCardComponent {

    @Input() displayName: string;
    @Input() values: CardSubElement[] = [];

    constructor() { }

}
