import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { InputDisplay } from '../dto/input-display.dto';

@Component({
    selector: 'input-query',
    template: `
        <at-so-input type="text" [caption]="'SMARTFLOW.SOURCES.PAGINATION.FILTER' | translate"
            [(value)]="search" (changed)="updateValue()"></at-so-input>

        <at-so-input type="number" [caption]="'SMARTFLOW.SOURCES.PAGINATION.PAGE' | translate"
            [(value)]="skip" (changed)="updateValue()"></at-so-input>

        <at-so-input type="number" [caption]="'SMARTFLOW.SOURCES.PAGINATION.LIMIT' | translate"
            [(value)]="limit" (changed)="updateValue()"></at-so-input>
    `
})

export class InputQueryComponent implements OnChanges {
    @Input()
    query: InputDisplay;

    @Output() changed = new EventEmitter();

    constructor() { }

    skip: number;
    limit: number;
    search: string;

    ngOnChanges() {
        if (this.query.value) {
            this.search = this.query.value.search;
            this.skip = this.query.value.skip;
            this.limit = this.query.value.limit;
        }
    }

    updateValue() {
        this.changed.emit({
            search: this.search,
            skip: this.skip,
            limit: this.limit,
        })
    }
}