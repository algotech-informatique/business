import { ApplicationModelDto, SnPageDto, SnPageWidgetDto } from '@algotech-ce/core';
import { AfterViewInit, Component, EventEmitter } from '@angular/core';
import { GridColumnConfigurationDto } from '../../../../../@components/grid/dto/grid-column-configuration.dto';
import { WorkflowLaunchService } from '../../../../../workflow-launcher/workflow-layout.lancher.service';
import { EventData, PageData } from '../../../../models';
import { PageEventsService } from '../../../../services/page-events.service';
import { Widget } from '../../widget.interface';

@Component({
    selector: 'widget-column',
    templateUrl: './widget-column.component.html',
    styleUrls: ['./widget-column.component.scss']
})

export class WidgetColumnComponent implements Widget, AfterViewInit {

    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    parent: SnPageWidgetDto;
    item: PageData;
    snPage: SnPageDto;
    readonly: boolean;
    custom: GridColumnConfigurationDto;
    event = new EventEmitter<EventData>();
    cellClickable = false;

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    constructor(private pageEventsService: PageEventsService, private workflowLaucher: WorkflowLaunchService) {}

    ngAfterViewInit() {
        const ev = this.widget.events.find((e) => e.eventKey.toLowerCase() === 'oncellclick');
        this.cellClickable = ev?.pipe?.length > 0;
    }

    initialize() {
    }

    onCellClick(UIEvent: Event) {
        if (this.cellClickable) {
            this.event.emit({ key: 'onCellClick', UIEvent});
            return ;
        }

        const events = this.pageEventsService.resolveEvents(this.appModel, this.snPage, this.parent.events, this.readonly, this.item);
        this.event.emit({ key: 'onRowClick', UIEvent, inherit: events});
    }

    onCellDblClick(UIEvent: Event) {
        const ev = this.widget.events.find((e) => e.eventKey.toLowerCase() === 'oncelldblclick');
        const hasActions = ev?.pipe?.length > 0;

        if (hasActions) {
            this.event.emit({ key: 'onCellDblClick', UIEvent});
            return ;
        }

        const events = this.pageEventsService.resolveEvents(this.appModel, this.snPage, this.parent.events, this.readonly, this.item);
        this.event.emit({ key: 'onRowDblClick', UIEvent, inherit: events});
    }
}