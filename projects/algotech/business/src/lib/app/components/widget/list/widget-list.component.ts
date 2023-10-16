import { SnPageWidgetDto, ApplicationModelDto, SnPageDto, SmartObjectDto, PairDto, SysQueryDto } from '@algotech-ce/core';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { PageData } from '../../../models';
import { Widget } from '../widget.interface';
import * as _ from 'lodash';
import { IonContent } from '@ionic/angular';
import { PageEventsService } from '../../../services/page-events.service';
import { PageCustomService } from '../../../services/page-custom.service';
import { PageUtilsService } from '../../../services/page-utils.service';
import { WidgetItterable } from '../itterable/widget-itterable';
import { CustomResolverParams } from '../../../../../../interpretor/src';

interface Element {
    widget: SnPageWidgetDto;
    item: PageData;
}

@Component({
    selector: 'widget-list',
    templateUrl: './widget-list.component.html',
    styleUrls: ['widget-list.component.scss'],
})
export class WidgetListComponent extends WidgetItterable implements Widget, AfterViewInit {
    @ViewChild(IonContent) content: IonContent;

    constructor(
        protected pageEventsService: PageEventsService,
        protected pageCustomService: PageCustomService,
        protected pageUtils: PageUtilsService,
        protected ref: ChangeDetectorRef) {
        super(pageEventsService, pageCustomService, pageUtils, ref);
    }

    ngAfterViewInit() {
        if (!this.widget.custom?.scrollbar && this.content) {
            this.content.scrollX = false;
            this.content.scrollY = false;
        }
    }

    filter(value: string) {
        this.query.search = value;
        this.search$.next(null);
    }

    loadMore() {
        this.query.skip++;
        this.loading = true;
        this.moreDataToLoad = false;
        this.createList(true).subscribe();
    }
}
