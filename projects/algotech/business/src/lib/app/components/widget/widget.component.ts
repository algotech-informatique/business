import { Subscription, zip } from 'rxjs';
import { AppWidgetDirective } from '../../directives/app-widget.directive';
import { SnPageWidgetDto, ApplicationModelDto, SnPageDto, PairDto, SysQueryDto } from '@algotech/core';
import {
    Component, Input, OnChanges, ViewChild, ViewContainerRef, ComponentRef,
    EventEmitter, SimpleChanges
} from '@angular/core';
import * as _ from 'lodash';
import { Widget } from './widget.interface';
import { PageEventsService } from '../../services/page-events.service';
import { PageCustomService } from '../../services/page-custom.service';
import { EventData, EventResolver, PageData } from '../../models';
import { map, mergeMap, tap } from 'rxjs/operators';
import { PageUtilsService } from '../../services/page-utils.service';
import { PageRulesService } from '../../services/page-rules.service';

@Component({
    selector: 'widget',
    template: `
        <div class="widget"
            [ngStyle]="{'cursor': !widget.custom?.disabled && eventClick ? 'pointer': 'inherit' }"
            [ngClass]="{
                'isdisabled': widget.custom?.disabled,
                'hidden': widget.custom?.hidden || !loaded
            }"
        >
            <ng-template widgetHost></ng-template>
        </div>      
    `,
    styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnChanges {

    @Input() appModel: ApplicationModelDto;
    @Input() snPage: SnPageDto;
    @Input() widget: SnPageWidgetDto;
    @Input() parent: SnPageWidgetDto;
    @Input() item: PageData;
    @Input() readonly = false;
    @Input() custom: any;
    @Input() types: Object;

    @ViewChild(AppWidgetDirective, { static: true }) widgetHost: AppWidgetDirective;

    events: EventResolver[] = [];

    instance: Widget;
    origin: SnPageWidgetDto;
    subscription: Subscription;
    resolveSubscription: Subscription;

    loaded = false;
    eventClick = false;

    constructor(
        private pageCustomService: PageCustomService,
        private pageEventsService: PageEventsService,
        private pageUtils: PageUtilsService,
        private pageRules: PageRulesService,
    ) {
        this.subscription = this.pageEventsService.changed.subscribe((data) => {
            if (this.loaded) {
                this.applyResolve();
            }
        });
    }

    ngOnDestroy(): void {
        if (this.resolveSubscription) {
            this.resolveSubscription.unsubscribe();
        }
        this.subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.widget?.currentValue) {
            this.eventClick = (this.widget.css.main && this.widget.events.find((e) => e.eventKey === 'onClick')?.pipe.length > 0);

            this.origin = _.cloneDeep(this.widget);
            this.widget.rules = [];

            this.applyResolve();
            this.loadWidget();
        }
    }

    loadWidget() {
        const component = this.selectWidgetComponent(this.widget);
        const viewContainerRef: ViewContainerRef = this.widgetHost.viewContainerRef;
        viewContainerRef.clear();

        const componentRef: ComponentRef<any> = viewContainerRef.createComponent(component);
        this.instance = componentRef.instance;
        this.instance.types = this.types;
        this.instance.appModel = this.appModel;
        this.instance.snPage = this.snPage;
        this.instance.origin = this.origin;
        this.instance.parent = this.parent;
        this.instance.widget = this.widget;
        this.instance.item = this.item;
        this.instance.readonly = this.readonly;
        this.instance.custom = this.custom;
        const event = new EventEmitter<EventData>();
        const data = new EventEmitter<PairDto>();
        this.instance.event = event;
        this.instance.data = data;
        event.asObservable().pipe(
            mergeMap((ev: EventData) => this.pageEventsService.launchEvent(this.events, ev)),
        ).subscribe();
        data.subscribe((data: PageData) => this.pageEventsService.notifyWidgetDataChanged(this.snPage, this.widget, data));
    }

    private selectWidgetComponent(widget: SnPageWidgetDto) {
        if (!this.types) {
            throw new Error('widget types not defined: ' + this.widget.typeKey);
        }
        return this.types[`Widget${widget.typeKey[0].toUpperCase() + widget.typeKey.slice(1)}Component`];
    }

    applyResolve() {
        if (this.resolveSubscription) {
            this.resolveSubscription.unsubscribe();
        }

        const state = _.cloneDeep(this.widget);
        this.resolveSubscription = this.resolve(true).pipe(
            tap(() => this.loaded = true),
            mergeMap(() => this.resolve()),
        ).subscribe(() => {
            if (this.instance?.onChanged && JSON.stringify(state) !== JSON.stringify(this.widget)) {
                this.instance.onChanged();
            }
        });
    }

    resolve(initialize = false) {
        // resolve all
        const allWidgets = [this.widget, ...this.pageUtils.getChilds(this.widget)];
        const allOrigin = [this.origin, ...this.pageUtils.getChilds(this.origin)];

        const resolve$ = this.childsMustResolved() ?
            zip(...allWidgets.map((widget) => {
                const origin = allOrigin.find((w) => w.id === widget.id);
                return this._resolve(widget, origin, initialize);
            })) :
            this._resolve(this.widget, this.origin, initialize);


        return resolve$.pipe(
            map(() => {
                this.events = this.pageEventsService.resolveEvents(this.appModel, this.snPage, this.widget.events, this.readonly, this.item);
                return;
            })
        );
    }

    _resolve(widget: SnPageWidgetDto, origin: SnPageWidgetDto, initialize: boolean) {
        return this.pageRules.applyRules(this.appModel, this.snPage, this.readonly, this.item, origin).pipe(
            map((widgetApplyRule: SnPageWidgetDto) => {

                widget.css = widgetApplyRule.css;
                widget.events = widgetApplyRule.events;

                return widgetApplyRule.custom;
            }),
            mergeMap((custom: any) => this.pageCustomService.resolveCustom(
                widget.custom,
                custom,
                initialize,
                this.item,
                { appModel: this.appModel, snPage: this.snPage, widget,
                    readonly: this.readonly, item: this.item, 
                        searchParameters: this.buildSearchParameters(origin),
                    },
            )
        ));
    }

    childsMustResolved(): boolean {
        return this.widget.group?.widgets.length > 0 && this.widget.group?.widgets.every((w) => !this.selectWidgetComponent(w));
    }

    buildSearchParameters(origin: SnPageWidgetDto): SysQueryDto {
        if (!origin.custom?.paginate?.limit) {
            return undefined;
        }
        const res: SysQueryDto = {};
        res.skip = 0;
        res.limit = origin.custom.paginate.limit;
        return res;
    }
}
