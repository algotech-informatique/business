import { SnPageWidgetDto, ApplicationModelDto, SnPageDto, SmartObjectDto, PairDto, SysQueryDto } from '@algotech-ce/core';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, ViewChild } from '@angular/core';
import { of, Subject, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, tap } from 'rxjs/operators';
import { EventData, PageData } from '../../../models';
import { Widget } from '../widget.interface';
import * as _ from 'lodash';
import { IonContent } from '@ionic/angular';
import { PageEventsService } from '../../../services/page-events.service';
import { PageCustomService } from '../../../services/page-custom.service';
import { PageUtilsService } from '../../../services/page-utils.service';
import { CustomResolverParams } from '../../../../../../interpretor/src';

interface Element {
    widget: SnPageWidgetDto;
    item: PageData;
}

export class WidgetItterable implements Widget {

    appModel: ApplicationModelDto;
    snPage: SnPageDto;
    _widget: SnPageWidgetDto;
    origin: SnPageWidgetDto;
    readonly: boolean;
    item: PageData;
    types: Object;
    event = new EventEmitter<EventData>();

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    height = 0;
    width = 0;

    query: SysQueryDto;
    moreDataToLoad = false;

    loading = false;

    elements: Element[] = [];
    search$ = new Subject();

    constructor(
        protected pageEventsService: PageEventsService,
        protected pageCustomService: PageCustomService,
        protected pageUtils: PageUtilsService,
        protected ref: ChangeDetectorRef) {
        let subscription: Subscription = null;
        this.search$.pipe(
            debounceTime(150),
            tap(() => {
                if (subscription) {
                    this.loading = false;
                    subscription.unsubscribe();
                }
            }),
            tap(() => {
                this.reset();
                this.loading = true;
                subscription = this.createList().subscribe();
            })).subscribe();
    }

    reset() {
        if (!this.query) {
            this.query = {
                skip: 0,
                limit: this.widget.custom.paginate.limit ? this.widget.custom.paginate.limit : 100,
            };
        } else {
            this.query.skip = 0;
        }
        this.elements = [];
        this.moreDataToLoad = false;
    }

    initialize() {
        if (!this._widget.group) {
            return;
        }
        const box = this.pageUtils.buildBox(this._widget.group.widgets);
        this.height = box.height + box.y;
        this.width = box.width + box.x;

        this.reset();
        this.loading = true;
        if (!_.isArray(this.widget.custom.collection)) {
            return;
        }
        this.loadItems();
    }

    onChanged() {
        this.loadItems();
    }

    loadItems() {
        if (!_.isArray(this.widget.custom.collection)) {
            this.reset();
            this.loading = false;
            return [];
        }

        const varName = this.pageCustomService.getVarInformation(this.origin.custom.collection);
        const collection = this.getCollection();

        const pageDataItems = collection.map((item) => {
            const pageData: PageData = {
                key: varName.varName,
                type: (item instanceof SmartObjectDto) ? `so:${item.modelKey.toLowerCase()}` : 'any',
                value: item instanceof SmartObjectDto ? item.uuid : item,
            };
            return pageData;
        })

        const difference = collection.length - this.elements.length;
        const moreDataToLoad = difference && this.widget.custom.paginate.limit ?
            pageDataItems.length > 0 &&
            difference === this.widget.custom.paginate.limit :
            false;
        if (moreDataToLoad) {
            this.moreDataToLoad = true;
        }

        this.ref.detectChanges();
        
        this.elements = _.map(pageDataItems, (item: PageData) => {
            const child: Element = {
                widget: _.cloneDeep(this.widget),
                item
            };
            return child;
        });
        this.loading = false;
    }

    createList(cumul = false) {
        const dataSource = this.getDataSource();
        if (!dataSource) {
            this.loadItems();
            return of({});
        }
        if (!cumul) {
            this.widget.custom.collection = [];
        }

        const event = this.pageEventsService.resolvePipeEvent(this.appModel, this.snPage, dataSource,
            this.readonly, { cumul, notify: true }, null, this.query);

        if (!event) {
            return of({});
        }

        return event.pipe(
            catchError((e) => {
                this.loading = false;
                return throwError(e);
            }),
            tap(() => {
                this.loading = false;
            })
        );
    }

    trackById(index, item: Element) {
        return item.item.value;
    }

    getCollection() {
        if (this.getDataSource()) {
            return this.widget.custom.collection;
        }

        // dynamic
        const params: CustomResolverParams = {
            searchParameters: {
                search: this.query.search,
                skip: 0,
                limit: ((this.query.skip + 1) * (this.widget.custom.paginate.limit ? this.widget.custom.paginate.limit : 100)),
            }
        };
        return this.pageCustomService.skipAndLimit(params, this.widget.custom.collection);
    }

    getDataSource() {
        const listValue = this.origin.custom.collection;
        const varName = this.pageCustomService.getVarInformation(listValue)?.varName;

        return this.snPage.dataSources.find((ev) => varName === `datasource.${ev?.key}`);
    }
}
