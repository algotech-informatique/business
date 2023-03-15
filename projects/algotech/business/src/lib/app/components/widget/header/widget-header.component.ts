import { ApplicationModelDto, SnPageDto, SnPageWidgetDto } from '@algotech/core';
import { Component, EventEmitter } from '@angular/core';
import { EventData } from '../../../models';
import { Widget } from '../widget.interface';

@Component({
    selector: 'widget-header',
    templateUrl: './widget-header.component.html',
    styleUrls: ['widget-header.component.scss'],
})
export class WidgetHeaderComponent implements Widget {

    appModel: ApplicationModelDto;
    event = new EventEmitter<EventData>();
    _widget: SnPageWidgetDto;
    snPage: SnPageDto;
    readonly: boolean;
    types: Object;
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.onChanges();
    }

    onChanges() {
    }

}
