import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { GenericListValueDto, GenericListDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { KeyFormaterService, NetworkService } from '@algotech-ce/angular';
import { TranslateService } from '@ngx-translate/core';
import { SoFormService } from '../../../../../so-form.service';
import { WorkflowDialogService } from '../../../../../../../../workflow-dialog/workflow-dialog.service';

interface DisplayData {
    key: string;
    value: string;
    selected: boolean;
}

@Component({
    selector: 'at-glist-list',
    styleUrls: ['./glist-list.component.scss'],
    templateUrl: './glist-list.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class GlistListComponent implements OnInit {

    values: GenericListValueDto[] = [];
    formatedValues: DisplayData[] = [];
    displayData: DisplayData[] = [];
    addShow = 10;
    nbShow = 0;
    obsSearch = new Subject();
    showLoadMore = false;
    showClear = false;
    searchPattern = '';
    listName: string;
    protected = true;
    multiple = false;
    selectedValues: string[] | string;
    glist: GenericListDto;

    changed = new EventEmitter();

    constructor(
        private keyFormater: KeyFormaterService,
        private translateService: TranslateService,
        private networkService: NetworkService,
        private soFormService: SoFormService,
        private workflowDialog: WorkflowDialogService,
    ) {

        this.obsSearch.pipe(
            debounceTime(500),
            map((pattern: string) => {
                if (pattern.length === 0) {
                    this.resetSearch();
                } else {
                    this.displayData = _.filter(this.formatedValues, (formatedValue: DisplayData) => {
                        return _.includes(formatedValue.value.toLowerCase(), pattern.toLowerCase());
                    });
                    this.showLoadMore = false;
                    this.showClear = true;
                }
            }),
        ).subscribe();
    }

    ngOnInit() {
        this.formatedValues = _.map(this.values, (value) => {
            const selected: boolean = this.multiple ?
                _.includes(this.selectedValues, value.key) :
                this.selectedValues === value.key;
            return { key: value.key, value: value.value, selected };
        });
        this.formatedValues = _.orderBy(this.formatedValues, ['selected'], ['desc']);
        this.loadMore();
    }

    loadMore() {
        this.displayData = this._loadList();
    }

    search() {
        this.obsSearch.next(this.searchPattern);
    }

    select(item: any) {
        if (!this.multiple) {
            this.changed.emit([{ key: item.key, value: item.value }]);
        } else {
            item.selected = !item.selected;
        }
    }

    addNewValue() {
        if (this.protected) { return; }
        if (this.networkService.offline) {
            this._showAlert(this.translateService.instant('WORKFLOW.SO-FORM.PROPERTY.GLIST.ADD.ERROR.NETWORK'));
        } else {
            const newItemKey: string = this.keyFormater.format(this.searchPattern);
            const existsKey: number = _.findIndex(this.values, (val: GenericListValueDto) => val.key === newItemKey);
            if (existsKey > -1) {
                this._showAlert(this.translateService.instant('SO-FORM-UNIQUE-PROPERTY'));
            } else {
                const newItem: GenericListValueDto = {
                    key: newItemKey,
                    value: [{
                        lang: this.translateService.currentLang,
                        value: this.searchPattern,
                    }],
                    index: this.values.length,
                };
                this.soFormService.updateGlistNewValue(this.glist, newItem).subscribe(() => {
                    if (!this.multiple) { this.changed.emit([{ key: newItemKey, value: this.searchPattern }]); }
                    this.formatedValues.unshift({ key: newItemKey, value: this.searchPattern, selected: true });
                    this.resetSearch();
                });
            }
        }
    }

    cancel() {
        this.changed.emit();
    }

    validate() {
        const selectedValues = _.filter(this.formatedValues, (item: DisplayData) => item.selected);
        this.changed.emit(selectedValues);
    }

    resetSearch() {
        this.searchPattern = '';
        this.nbShow = 0;
        this.showClear = false;
        this.displayData = [];
        this.loadMore();
    }

    _loadList(): DisplayData[] {
        const toAdd = _.slice(this.formatedValues, this.nbShow, this.nbShow + this.addShow);
        this.nbShow = this.nbShow + this.addShow;
        this.showLoadMore = (this.displayData.length + toAdd.length) < this.values.length;
        return _.concat(this.displayData, toAdd);
    }

    _showAlert(message: string) {
        this.workflowDialog.showToast({
            blur: false,
            message,
            time: 2000,
        });
    }

}
