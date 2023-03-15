import { PageEventsService } from '../../services/page-events.service';
import { PairDto, SnPageVariableDto, WorkflowDataDto, SnPageDto, ApplicationModelDto } from '@algotech/core';
import {
    Component, HostBinding, Input, ChangeDetectorRef, DoCheck, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild, OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { PageZoomService } from '../../services/page-zoom.service';
import { EventResolver } from '../../models';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as WidgetsTypes from '../widget';

@Component({
    selector: 'page-layout',
    templateUrl: './page-layout.component.html',
    styleUrls: ['page-layout.component.scss'],
    animations: [
        trigger('toggle', [
            state('hide',style({ opacity: 0, transform: 'translateY(-100%)' })),
            state('show', style({ opacity: 1, transform: 'translateY(0)' })),
            transition('* => *', animate('200ms ease-in'))
        ])
    ],
})
export class PageLayoutComponent implements OnInit, AfterViewInit, OnChanges, DoCheck {

    @ViewChild('content', { static: true }) contentElement: ElementRef;

    @HostBinding('style.background-color')
    bgColor: 'transparent';

    @Input() appModel: ApplicationModelDto;
    @Input() snPage: SnPageDto;
    @Input() readonly = false;
    @Input() variables: PairDto[] = [];

    backgroundColor: string;
    screenWidth: number;
    maxWidth: number;
    loaded = true;
    variables$: Observable<any>[];
    events: EventResolver[];
    lastScrollTop = 0;
    headerIsVisible = true;
    widgetTypes = WidgetsTypes; // for FIX NG3003;

    constructor(
        public ref: ChangeDetectorRef,
        private pageEventsService: PageEventsService,
        private pageZoomService: PageZoomService,
    ) { }
 
    ngDoCheck() {
        this.ref.detectChanges();
    }

    ngOnInit() {
        try {
            this.screenWidth = window.innerWidth;
            this.bgColor = this.snPage.css['background-color'];
        } catch (error) {
            console.error(error);
        }

        const subscription = this.pageEventsService.unload.subscribe((pageId: string) => {
            if (this.snPage?.id === pageId) {
                this.loaded = false;
                this.ref.detectChanges();
                subscription.unsubscribe();
            }
        })
    }

    ngAfterViewInit() {
        const zoom = this.snPage.custom?.zoom;
        if (zoom) {
            this.ref.detectChanges();
            this.pageZoomService.initialize(
                this.appModel.snApp,
                this.snPage,
                zoom.auto ? null : zoom.scale,
                zoom.min ? zoom.min : 0.1,
                zoom.max ? zoom.max : 10
            );
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.snPage?.currentValue) {
            this.pageEventsService.unloadDataSources();
        }
        if (changes.variables?.currentValue || changes.snPage?.currentValue) {
            const data: WorkflowDataDto[] = _.map(this.variables, (i: PairDto) => {
                const variable: SnPageVariableDto = _.find(this.snPage.variables, { key: i.key });
                return {
                    key: `variable.${i.key}`,
                    type: variable?.type,
                    value: i.value
                };
            });
            this.loaded = false;
            this.pageEventsService.resolveInputs(data).subscribe(() => {
                this.loaded = true;
                // load Event
                this.events = this.pageEventsService.resolveEvents(this.appModel, this.snPage, this.snPage.events, this.readonly,
                    null, null, { notify: false });
                this.pageEventsService.launchEvent(this.events, {key: 'onLoad', UIEvent: null}).subscribe();
            });
        }
    }

    trackById(index, item) {
        return item.id;
    }

    onScroll() {
        if (!this.snPage.header || !this.snPage.header.custom.hideRevealEffect) { return; }
        const st = this.contentElement.nativeElement.scrollTop;
        this.headerIsVisible = !(st > this.lastScrollTop)
        this.lastScrollTop = st <= 0 ? 0 : st;
    }

}
