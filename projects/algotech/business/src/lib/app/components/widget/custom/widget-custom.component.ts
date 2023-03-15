import { SnPageWidgetDto, ApplicationModelDto, SnPageDto } from '@algotech/core';
import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { EventData, PageData } from '../../../models';
import { Widget } from '../widget.interface';

@Component({
    selector: 'widget-custom',
    templateUrl: './widget-custom.component.html',
    styleUrls: ['widget-custom.component.scss'],
})
export class WidgetCustomComponent implements Widget {

    appModel: ApplicationModelDto;
    snPage: SnPageDto;
    _widget: SnPageWidgetDto;
    readonly: boolean;
    item: PageData;
    types: Object;
    event = new EventEmitter<EventData>();

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    constructor(private ref: ChangeDetectorRef) {
    }

    initialize() {
    }
}
