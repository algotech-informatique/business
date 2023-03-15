import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
    selector: 'at-so-form-property-input-object',
    template: `
        <div class="content" [ngClass]="{'error': error}" (click)="onItemClick()">
            <div class="display" *ngIf="display">
                {{ display }}
            </div>
            <div class="item-container">
                <span class="icon"><i [class]="icon"></i></span>
                <div class="item-content">
                    <div class="item-properties">
                        <div *ngIf="isUndefined" class="text">{{'SO-FORM-UNDEFINED-OBJECT' | translate}}</div>
                        <div *ngIf="!isUndefined">
                            <div class="text" *ngIf="text === null || text === undefined || text === ''">
                                {{ 'ITEM.NO-DISPLAY-AVAILABLE' | translate }}
                            </div>
                            <div class="text" *ngIf="text !== null && text !== undefined && text !== ''">{{text}}</div>
                        </div>
                    </div>
                </div>
                <div *ngIf="options" class="options" #options (click)="onActionClick($event, options)">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </div>
            </div>
        </div>
        <span class="error-caption" *ngIf="error">{{error}}</span>
    `,
    styleUrls: ['./so-form-property-input-object.component.scss']
})

export class SoFormPropertyInputObjectComponent {
    constructor() { }

    @Input() error: string;
    @Input() display: string;
    @Input() options = false;

    @Input() text: string;
    @Input() icon: string;
    @Input() isUndefined = false;

    @Output() itemClick = new EventEmitter();
    @Output() actionClick = new EventEmitter();

    onItemClick() {
        this.itemClick.emit();
    }

    onActionClick(event, component) {
        event.stopPropagation();
        this.actionClick.emit(component);
    }
}
