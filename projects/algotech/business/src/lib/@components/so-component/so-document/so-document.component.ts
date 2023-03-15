import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LinkDocument } from '../../../dto/link-document/link-document.dto';

@Component({
    selector: 'at-so-document',
    templateUrl: './so-document.component.html',
    styleUrls: ['./so-document.component.scss'],
})
export class SoDocumentComponent {

    @Input() error = false;
    @Input() display = '';
    @Input() element: LinkDocument;
    @Input() checkable = false;
    @Output() actionClick = new EventEmitter();

    onActionClick() {
        this.actionClick.emit();
    }

    constructor() {}

}
