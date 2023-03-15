import { Component, Input, Output, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'at-custom-editor',
    templateUrl: './custom-editor.component.html',
    styleUrls: ['./custom-editor.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomOptionEditorComponent implements OnInit {

    @Input() maxHeight = 300;
    @Output() changed = new EventEmitter();

    uuid: string;
    title: string;
    description: string;
    placeHolder: string;
    editText = '';
    tooltipText = '';

    constructor() {
    }

    ngOnInit() {
    }

    sendEditText() {
        this.changed.emit(this.editText);
    }

    onClose() {
        this.changed.emit('');
    }
}
