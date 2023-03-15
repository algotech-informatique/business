import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { CustomResolverParams } from '../../../../../interpretor/src';

@Component({
    template: `
        <div class="content">
            <div class="topbar">
                <div class="at-button" (click)="onBack()">
                    <i class="fa-solid fa-chevron-left"></i>
                </div>
                <span>{{'SO-FORM-SEARCH-OBJECT' | translate}}</span>
                <div class="at-button" *ngIf="multiple" (click)="onValidate()">
                    <i class="fa-solid fa-check"></i>
                </div>
            </div>

            <at-so-list
                class="so-list"
                [searchVisible]="searchVisible"
                [multipleSelection]="multiple"
                [type]="listType"
                [mode]="'cart'"
                [getItems]="getItems"
                [items]="items"
                (changeValue)="onChangeValue($event)"
                (handleError)="onError($event)"
            >
            </at-so-list>
        </div>
    `,
    styleUrls: ['./inputs-search.component.scss'],
})
export class InputsSearchComponent {

    @Input() multiple = false;
    @Input() items: any[] = [];
    @Input() getItems: (params?: CustomResolverParams) => Observable<any>;
    @Input() searchVisible = true;
    @Input() listType;

    @Output() handleError = new EventEmitter<string>();
    @Output() changeValue = new EventEmitter();

    output: any = null;

    onChangeValue(event) {
        this.output = event.value;
        if (!this.multiple) {
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
}
