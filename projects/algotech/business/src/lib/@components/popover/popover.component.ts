import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { Popover } from './interfaces/popver.interface';
import { PopoverDirective } from './directives/popover-host.directive';

@Component({
    selector: 'popover',
    template: `
    <div class="background" #content [ngClass]="{
        'active': popupPos
    }"></div>

    <div class="alert" (mousedown)="closeOptions()">
        <!-- popup !-->
        <div class="container" *ngIf="popupPos">
            <div class="popup" (mousedown)="$event.stopPropagation()" [ngStyle]="{
                'position': popupPos.top || popupPos.bottom ? 'absolute': 'inherit',
                'top': popupPos.top != null ? popupPos.top + 'px' : null,
                'left': popupPos.left != null ? popupPos.left + 'px' : null,
                'right': popupPos.right != null ? popupPos.right + 'px': null,
                'bottom': popupPos.bottom != null ? popupPos.bottom + 'px': null,
                'width': popupPos.width ? popupPos.width + 'px' : 'var(--ACTION-WIDTH)',
                'height': popupPos.height ? popupPos.height + 'px' : 'unset',
                'background-color': (popupBackcolor) ? popupBackcolor : 'var(--ALGOTECH-BACKGROUND)',
                'max-width': popupPos.maxWidth ? popupPos.maxWidth + 'px' : null
            }" #popup>
                <ng-template wf-popup-host></ng-template>
            </div>
        </div>
    </div>
        `,
    styleUrls: ['./popover.component.scss'],
})

export class PopoverComponent implements AfterViewInit, OnDestroy {
    @ViewChild('content') content: ElementRef;
    @ViewChild('popup', { static: false, read: ElementRef }) popupHostRef: ElementRef;
    @ViewChild(PopoverDirective, { static: false }) popupHost: PopoverDirective;

    @Input()
    showPopup: Subject<Popover>;

    @Input()
    dismissPopup: Subject<any>;

    @Output()
    dismissed = new EventEmitter<boolean>();

    subscription: Subscription;
    popupPos: { top: number, left: number, right?: number, bottom?: number, width?: number, height?: number, maxWidth?: number };
    popupBackcolor = '';

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private ref: ChangeDetectorRef) { }

    ngAfterViewInit() {
        this.subscription = this.showPopup.subscribe((data: Popover) => {
            // load outside
            this.popupPos = {
                top: -10000,
                left: -10000,
            };
            this.popupBackcolor = (data.backcolor) ? data.backcolor : '';

            this.ref.detectChanges();
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(data.component);
            const viewContainerRef = this.popupHost.viewContainerRef;
            viewContainerRef.clear();
            const componentRef = viewContainerRef.createComponent(componentFactory);

            // props
            for (const propKey of Object.keys(data.props)) {
                componentRef.instance[propKey] = data.props[propKey];
            }
            this.ref.detectChanges();

            // adapt pos
            const popupRect = this.popupHostRef.nativeElement.getBoundingClientRect();
            popupRect.width = data.width ? data.width : popupRect.width;
            popupRect.height = data.height ? data.height : popupRect.height;
            const viewRect = this.content.nativeElement.getBoundingClientRect();
            if (!data.event) {
                this.popupPos = {
                    top: null,
                    left: null,
                };
                if (data.width) {
                    this.popupPos.width = data.width;
                }
                if (data.height) {
                    this.popupPos.height = data.height;
                }
                return ;
            }
            const rect = (data.event.sourceEvent ? data.event.sourceEvent : data.event).srcElement.getBoundingClientRect();
            const pos: { top: number, left: number, right?: number, bottom?: number, width?: number, height?: number, maxWidth?: number } = {
                top: (rect.y - viewRect.y + rect.height) + 5,
                left: (rect.x - viewRect.x),
                maxWidth: data.maxWidth,
            };
            if ((rect.y + popupRect.height) > (viewRect.top + viewRect.height - 5)) {
                pos.top = null;
                pos.bottom = 5;
            }
            if ((rect.x + popupRect.width) > (viewRect.left + viewRect.width - 5)) {
                pos.left = null;
                pos.right = 5;
            }
            if (data.width) {
                pos.width = data.width;
            }
            if (data.height) {
                pos.height = data.height;
            }

            this.popupPos = pos;
        });
        this.subscription.add(this.dismissPopup.subscribe(() => {
            this.popupPos = null;
            this.dismissed.emit(true);
        }));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    closeOptions() {
        this.popupPos = null;
        this.dismissed.emit(true);
    }
}

