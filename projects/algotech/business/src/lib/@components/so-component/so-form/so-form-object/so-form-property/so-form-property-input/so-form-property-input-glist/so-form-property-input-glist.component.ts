import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { GenericListDto, GenericListValueDto } from '@algotech/core';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { GlistListComponent } from './glist-list/glist-list.component';
import { map } from 'rxjs/operators';
import { WorkflowDialogService } from '../../../../../../../workflow-dialog/workflow-dialog.service';

@Component({
    selector: 'at-so-form-property-input-glist',
    styleUrls: ['./so-form-property-input-glist.component.scss'],
    templateUrl: './so-form-property-input-glist.component.html',
})
export class SoFormPropertyInputGListComponent implements OnChanges {

    @Input() display = '';
    @Input() disabled = false;
    @Input() glist: GenericListDto = null;
    @Input() error = '';
    @Input() context = null;
    @Input() multiple = false;
    @Input() option: any = null;
    @Output() changeValue = new EventEmitter;

    displayMode: 'bubble' | 'list' | 'select' = 'select';
    random = false;
    values: any[] = [];
    isLoading = true;
    _value: any = null;
    valueDisplay: string = null;

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

    constructor(
        private workflowDialog: WorkflowDialogService
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.multiple) {
            if (this.option) {
                if (this.option.display) {
                    this.displayMode = this.option.display;
                }

                if (this.option.sort) {
                    this.random = this.option.sort === 'random';
                }
            }
            this.values = this.random ? this.shuffle(this.glist.values) : this.glist.values;
            if (this.multiple) {
                if (this.value) {
                    const selectedValues = _.map(this.value, (val: string) => {
                        const item = _.find(this.values, (value: GenericListValueDto) => val === value.key);
                        if (item) { return item.value; }
                    });
                    this.valueDisplay = _.join(selectedValues, ', ');
                }
            } else {
                const selectedValue = _.find(this.values, (val: GenericListValueDto) => val.key === this.value);
                if (selectedValue) { this.valueDisplay = selectedValue.value; }
            }
            this.isLoading = false;
        }
    }

    shuffle(array: GenericListValueDto[]) {
        const res = [...array];
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
    }

    onChangeValue(value?) {
        if (value) {
            this.value = value;
        }
        this.changeValue.emit();
    }

    checkItem(key: string) {
        if (!this.multiple) {
            this.value = key;
        } else {
            let _values = [...this.value as any[]];
            const index = _values.indexOf(key);
            if (index > -1) {
                _values.splice(index, 1);
            } else {
                _values.push(key);
                _values = _values.sort();
            }

            this.value = _values;
        }
        this.changeValue.emit();
    }

    showListPopup(event) {
        const changed = new EventEmitter();
        this.workflowDialog.showPopup.next({
            component: GlistListComponent,
            props: {
                values: this.values,
                listName: this.display,
                protected: this.glist.protected,
                multiple: this.multiple,
                selectedValues: this.value,
                glist: this.glist,
                changed,
            }
        });
        changed.pipe(
            map((data) => {
                this.workflowDialog.dismiss();
                if (!data) { return of(null); }
                if (this.multiple) {
                    this.value = _.map(data, (item) => item.key);
                    this.valueDisplay = _.join(_.map(data, (item) => item.value), ', ');
                } else {
                    this.value = data[0].key;
                    this.valueDisplay = data[0].value;
                }
                this.onChangeValue();
            }),
        ).subscribe();
    }

    resetValue() {
        this.value = null;
        this.valueDisplay = null;
        this.onChangeValue();
    }

}

