import { Subject, Subscription } from 'rxjs';
import { SmartPropertyModelDto } from '@algotech/core';
import { SoFormService } from '../../../../so-form.service';
import { Component, EventEmitter, Input, Output, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { debounceTime, tap, delay } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'at-so-form-property-input-dropdown',
    styleUrls: ['./so-form-property-input-dropdown.component.scss'],
    templateUrl: './so-form-property-input-dropdown.component.html',
})
export class SoFormPropertyInputDropdownComponent implements OnDestroy, AfterViewInit {

    @Input() error = '';
    @Input() autoFocus = false;
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
    show = false;
    showMoreButton = false;
    subscription: Subscription;
    skip = 0;
    limit = 10;
    inputSearch = false;
    loading = false;

    constructor(
        private soFormService: SoFormService,
    ) {
        let dataSourceSubscription = null;
        this.subscription = this.obsSearch.pipe(
            debounceTime(200),
            tap(() => {
                if (dataSourceSubscription) {
                    dataSourceSubscription.unsubscribe();
                }
            }),
            tap((pattern: string) => {
                if (this.inputSearch) {
                    this.dataSource = [];
                }
                this.loading = true;
                dataSourceSubscription = this.soFormService.dataSource(this.property, this.skip, this.limit, pattern)
                    .subscribe(
                        (res) => {
                            this.showMoreButton = res.length === this.limit;
                            if (this.inputSearch) {
                                this.dataSource = res.length === 0 ? null : res;
                            } else {
                                if (res.length > 0) {
                                    this.dataSource = this.dataSource ? _.concat(this.dataSource, res) : res;
                                }
                            }
                            this.loading = false;
                        }
                    );
            }),
        ).subscribe();
    }

    ngAfterViewInit() {
        if (this.autoFocus) {
            this.obsSearch.next(this.value);
        }
    }

    search() {
        this.inputSearch = true;
        this.skip = 0;
        this.obsSearch.next(this.value);
    }

    select(value: string) {
        this.value = value;
        this.changeValue.emit();
        this.hideList();
    }

    loadMore() {
        this.skip++;
        this.inputSearch = false;
        this.obsSearch.next(this.value);
    }

    clickInput() {
        if (!this.show) {
            this.dataSource = [];
            this.search();
            this.show = true;
        }
    }

    hideList() {
        this.skip = 0;
        this.show = false;
        this.dataSource = null;
    }

    onChangeValue() {
        this.changeValue.emit();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
