import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'at-so-form-property-input-boolean',
    styleUrls: ['./so-form-property-input-boolean.component.scss'],
    templateUrl: './so-form-property-input-boolean.component.html',
})
export class SoFormPropertyInputBooleanComponent {

    @Input() display = '';
    @Input() disabled = false;
    @Input() style = 'underline';
    @Input() label = 'stacked';
    @Input() option: any = null;
    @Input() error = '';
    @Output() changeValue = new EventEmitter;

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

    ngOnChanges() {
        if (this.option && this.option.display !== 'yes-no' && this.value === null) {
            // set value to false when toggle or checkbox (two states) but not for yes-no (three states)
            this.onChangeValue(false);
        }
    }

    onChangeValue(value?: boolean) {
        if (value !== undefined) {
            this.value = value;
        }
        this.changeValue.emit();
    }
}

