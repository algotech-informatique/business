import { SnPageWidgetDto, ApplicationModelDto } from '@algotech-ce/core';
import { EventData } from '../../../models';
import { Component, EventEmitter } from '@angular/core';
import { Widget } from '../widget.interface';

@Component({
  selector: 'widget-text',
  templateUrl: './widget-text.component.html',
  styleUrls: ['widget-text.component.scss'],
})
export class WidgetTextComponent implements Widget {

    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
    }

    onClick(UIEvent: Event) {
        this.event.emit({ key: 'onClick', UIEvent});
    }
}
