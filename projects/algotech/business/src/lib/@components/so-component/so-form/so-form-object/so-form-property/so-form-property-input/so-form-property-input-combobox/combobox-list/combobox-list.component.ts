import { Component, OnInit, ViewEncapsulation, OnDestroy, EventEmitter } from '@angular/core';
import { SmartPropertyModelDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, delay, tap } from 'rxjs/operators';
import { SoFormService } from '../../../../../so-form.service';

@Component({
    selector: 'at-combobox-list',
    styleUrls: ['./combobox-list.component.scss'],
    templateUrl: './combobox-list.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ComboboxListComponent implements OnInit, OnDestroy {

    obsSearch = new Subject();
    showLoadMore = false;
    showClear = false;
    property: SmartPropertyModelDto;
    subscription: Subscription;
    skip = 0;
    limit = 10;
    inputSearch = false;
    dataSource = [];
    value;
    selectedValues;
    showSpinner = false;
    changed = new EventEmitter();

    constructor(
        private soFormService: SoFormService,
    ) {
        let dataSourceSubscription: Subscription = null;
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
                this.showSpinner = true;
                dataSourceSubscription = this.soFormService.dataSource(this.property, this.skip, this.limit, pattern)
                    .subscribe(
                        (res) => {
                            this.showLoadMore = res.length === this.limit;
                            if (this.inputSearch) {
                                this.dataSource = res.length === 0 ? null : res;
                            } else {
                                if (res.length > 0) {
                                    this.dataSource = this.dataSource ? _.concat(this.dataSource, res) : res;
                                }
                            }
                            this.showSpinner = false;
                        }
                    );
            }),
        ).subscribe();
    }

    ngOnInit() {
        this.value = '';
        this.search();
    }

    resetSearch() {
        this.value = '';
        this.skip = 0;
        this.showClear = false;
        this.search();
    }

    search() {
        this.showClear = this.value.length > 0;
        this.inputSearch = true;
        this.skip = 0;
        this.obsSearch.next(this.value);
    }

    select(value: string) {
        this.value = value;
        this.changed.next(this.value);
    }

    loadMore() {
        this.skip++;
        this.inputSearch = false;
        this.obsSearch.next(this.value);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
