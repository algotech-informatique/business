import { Component, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SmartObjectDto } from '@algotech/core';
import { SmartObjectsService } from '@algotech/angular';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { CustomResolverParams, InterpretorService } from '../../../../../../interpretor/src';

@Component({
    template: `
            <div class="content">
                <div class="topbar">
                    <div class="at-button" (click)="onBack()">
                        <i class="fa-solid fa-chevron-left"></i>
                    </div>
                    <span>{{'SO-FORM-SEARCH-OBJECT' | translate}}</span>
                    <div class="at-button" *ngIf="multipleSelection" (click)="onValidate()">
                        <i class="fa-solid fa-check"></i>
                    </div>
                </div>

                <at-so-list
                    class="so-list"
                    [searchVisible]="true"
                    [multipleSelection]="multipleSelection"
                    [type]="'so:'"
                    [mode]="'cart'"
                    [getItems]="getItems"
                    [items]="items"
                    (changeValue)="onChangeValue($event)"
                    (handleError)="onError($event)"
                >
                </at-so-list>
            </div>
    `,
    styleUrls: ['./so-form-search.component.scss'],
})
export class SoFormSearchComponent implements AfterViewInit {

    @Input() multipleSelection = false;
    @Input() items: SmartObjectDto[] = [];
    @Input() modelKey: string;
    @Output() handleError = new EventEmitter<string>();
    @Output() changeValue = new EventEmitter();

    output: SmartObjectDto[]|SmartObjectDto = null;
    getItems: (params?: CustomResolverParams) => Observable<SmartObjectDto[]> = null;

    constructor(
        private ref: ChangeDetectorRef,
        private smartObjectsService: SmartObjectsService) {
    }

    onChangeValue(event) {
        this.output = event.value;
        if (!this.multipleSelection) {
            this.changeValue.emit(this.output);
        }
    }

    onValidate() {
        this.changeValue.emit(this.output);
    }

    onBack() {
        this.changeValue.emit(null);
    }

    onError(error: string) {
        this.handleError.emit(error);
    }

    ngAfterViewInit() {
        this.getItems = (params?: CustomResolverParams) => {
            return this.smartObjectsService.searchByProperty(this.modelKey, null, params?.searchParameters?.search ? params.searchParameters.search : null, InterpretorService.paramsToPair(params));
        };
        this.ref.detectChanges();
    }
}
