import { Subject, Subscription } from 'rxjs';
import { SmartPropertyModelDto } from '@algotech-ce/core';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { WorkflowDialogService } from '../../../../../../../workflow-dialog/workflow-dialog.service';
import { ComboboxListComponent } from './combobox-list/combobox-list.component';

@Component({
    selector: 'at-so-form-property-input-combobox',
    styleUrls: ['./so-form-property-input-combobox.component.scss'],
    templateUrl: './so-form-property-input-combobox.component.html',
})
export class SoFormPropertyInputComboboxComponent {

    @Input() error = '';
    @Input() property: SmartPropertyModelDto;

    _value: any = undefined;
    @Input()
    get value() {
        return this._value;
    }

    @Output()
    valueChange = new EventEmitter();
    set value(data) {
        this._value = data;
        this.valueChange.emit(data);
    }
    @Output() changeValue = new EventEmitter();

    @ViewChild('dropdown') dropdown: ElementRef;

    dataSource;
    obsSearch = new Subject();
    showListTop = false;
    showListBottom = false;
    showMoreButton = false;
    subscription: Subscription;
    skip = 0;
    limit = 10;
    inputSearch = false;

    constructor(
        private workflowDialog: WorkflowDialogService,
    ) { }

    showListPopup() {
        const changed = new EventEmitter();
        this.workflowDialog.showPopup.next({
            component: ComboboxListComponent,
            props: {
                selectedValues: this.value,
                property: this.property,
                changed,
            }
        });
        changed.pipe(
            map((data) => {
                this.workflowDialog.dismiss();
                if (data && data) {
                    this.value = data;
                    this.changeValue.emit();
                }
            }),
        ).subscribe();
    }

    resetValue() {
        this.value = '';
        this.changeValue.emit();
    }
}
