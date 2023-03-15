import { ApplicationModelDto, SnPageDto, SnPageWidgetDto } from '@algotech/core';
import { Component, EventEmitter } from '@angular/core';
import { EventData } from '../../../models';
import { Widget } from '../widget.interface';

@Component({
    selector: 'widget-footer',
    templateUrl: './widget-footer.component.html',
    styleUrls: ['widget-footer.component.scss'],
})
export class WidgetFooterComponent implements Widget {

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
