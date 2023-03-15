import { Component, EventEmitter, Input, Output, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'toolbox-item',
    template: `
    <div class="content" #content
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()">

        <div class="popup" (click)="onClickContent()" *ngIf="popupVisible" (clickOutside)="onClickOutside($event)">
            <ng-content></ng-content>
        </div>
        <span class="item" [ngClass]="{'widget': isWidgetSelector}" [ngStyle]="{'color': color}"
            (click)="onClickIcon()">
            <div class="icon" [ngStyle]="{
                    'background-color': active ? 'var(' + activeColors[0] + ')' : 'inherit',
                    'color': active ? 'var(' + activeColors[1] + ')' : 'inherit',
                    'font-size': fontSize ? fontSize : 'var(--TOOLBAR-ITEM-FONT-SIZE)'
                }"
                [ngClass]="{
                    'disabled': disabled,
                    'active': active
                }"
                (click)="onClick()">
                <i [class]="iconClassName + ' iconFa'"></i>
                <span *ngIf="tooltip" class="tooltiptext">{{ tooltip | translate }}</span>
                <i class="fa-solid fa-caret-down dropdown" [ngClass]="{'rightDirection': rightDirection}" *ngIf="dropdown === 'hover'"></i>

                <div *ngIf="lineColor" class="line" [ngStyle]="{'border-bottom': '3px solid ' + lineColor}"></div>
            </div>
        </span>
    </div>
  `,
    styleUrls: ['./toolbox-item.component.scss'],
})
export class ToolBoxItemComponent implements AfterViewInit {
    @ViewChild('content') content: ElementRef;

    @Input()
    iconClassName: string;

    @Input()
    tooltip: string;

    @Input()
    color = 'var(--TOOLBAR-COLOR)';

    @Input()
    active = false;

    @Input()
    activeColors = ['--TOOLBAR-ITEM-ACTIVE', '--TOOLBAR-ITEM-ACTIVE-COLOR'];

    @Input()
    fontSize: string;

    @Input()
    disabled = false;

    @Input()
    lineColor: string;

    @Input()
    dropdown: 'hover' | 'click';

    @Input()
    closeOnSelect = false;

    popupVisible = false;
    isWidgetSelector = false;
    rightDirection = false;

    @Output()
    clicked = new EventEmitter();

    constructor(private ref: ChangeDetectorRef) { }

    ngAfterViewInit() {
        this.isWidgetSelector = this.iconClassName.split(' ').pop() === 'widget';
        const width = getComputedStyle(this.content.nativeElement).getPropertyValue('--TOOLBAR-WIDTH')?.trim();
        this.rightDirection = !!width && width !== 'none' && width !== 'undefined';
        this.ref.detectChanges();
    }

    onClick() {
        this.clicked.emit();
    }

    onMouseEnter() {
        if (this.dropdown !== 'hover') {
            return;
        }
        this.popupVisible = true;
    }

    onMouseLeave() {
        if (this.dropdown !== 'hover') {
            return;
        }
        setTimeout(() => {
            const hover: Element[] = Array.prototype.slice.call(document.querySelectorAll(':hover'));
            this.popupVisible = hover.some((ele) => ele === this.content.nativeElement);
        }, 100);
    }

    onClickIcon() {
        if (this.dropdown !== 'click') {
            return;
        }
        this.popupVisible = !this.popupVisible;
    }

    onClickContent() {
        if (this.closeOnSelect) {
            this.popupVisible = false;
        }
    }

    onClickOutside($event) {
        if (this.content.nativeElement.contains($event.target)) {
            return ;
        }
        if (this.dropdown !== 'click') {
            return;
        }
        this.popupVisible = false;
    }

}
