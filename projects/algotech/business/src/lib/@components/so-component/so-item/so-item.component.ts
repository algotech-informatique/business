import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ISoItemObject } from './so-item.interface';

@Component({
    selector: 'at-so-item',
    styleUrls: ['./so-item.component.scss'],
    templateUrl: './so-item.component.html',
})
export class SoItemComponent {

    @Input() object: ISoItemObject = null;
    @Input() checkable = false;
}

