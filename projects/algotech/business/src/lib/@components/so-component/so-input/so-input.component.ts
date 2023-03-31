import { DataService } from '@algotech-ce/angular';
import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'at-so-input',
    styleUrls: ['./so-input.component.scss'],
    template: `
        <!-- SEARCH -->
        <div class="searchBar" *ngIf="type === 'search'">
            <i class="fa-solid fa-magnifying-glass icon-search"></i>
            <input #input type="text"
                [placeholder]="'SEARCHBOX.PLACEHOLDER' | translate"
                (keyup)="onKeyup($event)"
                [(ngModel)]="value"
                (change)="onChange()">
            <i class="fa-solid fa-xmark icon-remove" *ngIf="value" (click)="onRemoveSearch()"></i>
        </div>

        <!-- INPUT -->
        <div class="container" *ngIf="type !== 'checkbox' && type !== 'radio' && type !== 'search'">
            <div class="input" [ngClass]="{
                'error': error,
                'mobile': dataService.mobile
            }">
                <span class="caption" *ngIf="caption">{{caption}}</span>
                <input *ngIf="type === 'text'" #input type="text" [placeholder]="placeholder" [autofocus]="autoFocus"
                    (keyup)="onKeyup($event)" (keyup.enter)="enter.emit(input.value)" [disabled]="disabled"
                    (change)="onChange()" [maxlength]="maxlength" [(ngModel)]="value">

                <input *ngIf="type === 'number'" #input type="number" [placeholder]="placeholder"
                    (keyup)="onKeyup($event)" (keyup.enter)="enter.emit(input.value)" [disabled]="disabled"
                    (change)="onChange()" [maxlength]="maxlength" [(ngModel)]="value">

                <input class="date" *ngIf="type === 'datetime'" #input type="datetime-local" [placeholder]="placeholder"
                    (keyup)="onKeyup($event)" (keyup.enter)="enter.emit(input.value)" [disabled]="disabled"
                    (focusout)="onChange(input.value)" [value]="value | dateFormat:'YYYY-MM-DDTHH:mm'">

                <input class="date" *ngIf="type === 'date'" #input type="date" [placeholder]="placeholder"
                    (keyup)="onKeyup($event)" (keyup.enter)="enter.emit(input.value)" [disabled]="disabled"
                    (focusout)="onChange(input.value)" [value]="value | dateFormat:'YYYY-MM-DD'">

                <input class="date time" *ngIf="type === 'time'" #input type="time" [placeholder]="placeholder"
                    (keyup)="onKeyup($event)" (keyup.enter)="enter.emit(input.value)" [disabled]="disabled"
                    (focusout)="onChange(input.value)" [value]="value | dateFormat:'HH:mm:ss': 'HH:mm:ss'">

                <select name="select" *ngIf="type === 'select'" #select
                    (change)="onChange(select.value)">
                    <option *ngFor="let item of items" [selected]="value === item.key" [value]="item.key">{{item.value}}</option>
                </select>

                <i [class]="icon + ' icon'" *ngIf="icon"></i>

                <textarea *ngIf="type === 'textarea'"
                    id="textarea"
                    [ngClass]="{
                        'mobile': platform === 'mobile',
                        'autoHeight': autoHeight
                    }"
                    [rows]="1"
                    #input
                    [maxlength]="maxlength"
                    [placeholder]="placeholder"
                    (keyup)="onKeyup($event)"
                    (input)="reloadTextArea($event, input)"
                    (keyup.enter)="enter.emit(input.value)"
                    (change)="onChange()"
                    [(ngModel)]="value">
                </textarea>
            </div>
            <span class="error-caption" [ngClass]="{visible: error}">{{error}}</span>
        </div>

        <!-- CHECKBOX -->
        <div class="checkbox" *ngIf="type === 'checkbox' || type === 'radio'"
            [ngStyle]="{'pointer-events': (type === 'radio' && value) || disabled ? 'none' : 'all'}"
            [ngClass]="{
                'active': value
            }"
            (click)="onChange(!value)">

            <div *ngIf="type === 'checkbox'" class="checkbox-content">
                <i class="fa-regular fa-square" *ngIf="inputStyle !== 'toggle' && !value"></i>
                <i class="fa-solid fa-square-check" *ngIf="inputStyle !== 'toggle' && value"></i>
                <i class="fa-solid fa-toggle-off" [ngStyle]="{'font-size': '22px'}" *ngIf="inputStyle === 'toggle' && !value"></i>
                <i class="fa-solid fa-toggle-on" [ngStyle]="{'font-size': '22px'}" *ngIf="inputStyle === 'toggle' && value"></i>
                <span>{{caption}}</span>
            </div>

            <div *ngIf="type === 'radio'" class="radio-content">
                <div class="circle-border">
                    <div class="circle-content" *ngIf="value"></div>
                </div>
                <span>{{caption}}</span>
            </div>
        </div>
    `
})
export class SoInputComponent implements AfterViewInit {

    @ViewChild('input') input: ElementRef;
    @Input() type = 'text';
    @Input() error = '';
    @Input() caption = '';
    @Input() icon: string;
    @Input() placeholder = '';
    @Input() autoHeight = true;
    @Input() maxlength = null;
    @Input() items = [];
    @Input() inputStyle;
    @Input() autoFocus = false;
    @Input() disabled = false;

    _value: any = undefined;
    @Input()
    get value() {
        return this._value;
    }

    platform;

    @Output()
    valueChange = new EventEmitter();
    set value(data) {
        this._value = data;
        this.valueChange.emit(data);
    }

    @Output() changed = new EventEmitter();
    @Output() keyup = new EventEmitter();
    @Output() enter = new EventEmitter();

    constructor(public dataService: DataService) {}

    ngAfterViewInit() {

        this.platform = (this.dataService.mobile) ? 'mobile': 'desktop';
        if (this.autoFocus) {
            setTimeout(() => {
                if (this.input) {
                    this.input.nativeElement.focus();
                }
            }, 250);
        }
        if (this.autoHeight) {
            setTimeout(() => {
                if (this.input && this.type === 'textarea') {
                    this.input.nativeElement.style.height = (this.input.nativeElement.scrollHeight + 3) + 'px';
                }
            }, 100);
        }
    }

    reloadTextArea(event, element) {
        if (this.autoHeight) {
            element.style.height = 'auto';
            element.style.height = (element.scrollHeight + 3) + 'px';
            event.stopPropagation();
        }
    }

    onKeyup($event) {
        $event.stopPropagation();
        this.keyup.emit($event.srcElement.value);
    }

    onChange(value?) {
        if (value !== undefined) {
            this.value = value;
        }
        this.changed.emit(this.value);
    }

    onRemoveSearch() {
        this.value = '';
        this.changed.emit('');
        this.keyup.emit('');
    }
}

