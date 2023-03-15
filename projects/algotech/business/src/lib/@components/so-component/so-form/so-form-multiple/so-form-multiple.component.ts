import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SmartPropertyModelDto, SmartObjectDto } from '@algotech/core';
import * as _ from 'lodash';
import { ISoFormBreadCrumb } from '../so-form-interface';
import { SoFormService } from '../so-form.service';

@Component({
    selector: 'at-so-form-multiple',
    styleUrls: ['./so-form-multiple.component.scss'],
    templateUrl: './so-form-multiple.component.html',
})
export class SoFormMultipleComponent {

    constructor(private soFormService: SoFormService) {
    }

    @Input() property: SmartPropertyModelDto;
    @Input() values: any[];
    @Input() disabled = false;
    @Output() changeView = new EventEmitter();
    @Output() changeValue = new EventEmitter();
    @Output() close = new EventEmitter();
    @Output() added = new EventEmitter();

    association = true;
    _disabled = false;
    _values: { value: string }[] = []; // add an object array for never update the instance of item

    initialize() {
        this._values = _.map(this.values, (value) => {
            return { value };
        });

        this.association = this.property.keyType.startsWith('so:') && !this.property.composition;
        this.calculate();
    }

    remove(event, index: number) {
        if (this.property.keyType.startsWith('so:')) {
            this.soFormService.deleteCascade(this.values[index]);
        }

        this._values.splice(index, 1);
        this.values.splice(index, 1);
        this.changeValue.emit(this.values);
        this.calculate();
    }

    add() {
        const newValue = null;
        this._values.push({ value: newValue });
        this.added.emit();

        this._disabled = true;
    }

    search() {
        const modelKey = this.property.keyType.replace('so:', '');
        const objects = this.soFormService.getObjects();

        const items = _.compact(
            _.map(this.values, (v) => {
                return _.find(objects, (so) => so.uuid === v);
            })
        );

        this.soFormService.searchObject(modelKey, true, items).subscribe(
            (smartObjects: SmartObjectDto[]) => {
                if (smartObjects) {

                    // check delete object
                    _.forEach(this.values, (v) => {
                        if (!_.find(smartObjects, (so) => so.uuid === v)) {
                            this.soFormService.deleteCascade(v);
                        }
                    });

                    this.values.splice(0, this.values.length);
                    this._values.splice(0, this._values.length);

                    _.forEach(smartObjects, (smartObject: SmartObjectDto) => {
                        this.values.push(smartObject.uuid);
                        this._values.push({ value: smartObject.uuid });
                    });

                    this.changeValue.emit(this.values);
                }

                this.calculate();
            }
        );

        this._disabled = true;
    }

    calculate() {
        this._disabled = this.disabled || (this._values && this._values.length > 0 &&
            !this._values[this._values.length - 1].value);
    }

    onChangeView(data: ISoFormBreadCrumb) {
        this.changeView.emit(data);
    }

    onChangeValue(value: any, index: number) {
        this.values[index] = value;
        this._values[index].value = value;

        this.changeValue.emit(this.values);
        this.calculate();
    }
}

