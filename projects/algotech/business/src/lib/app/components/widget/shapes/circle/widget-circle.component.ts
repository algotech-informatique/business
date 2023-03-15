import { SnPageWidgetDto } from '@algotech/core';
import { Component } from '@angular/core';

@Component({
  selector: 'widget-circle',
  templateUrl: './widget-circle.component.html',
  styleUrls: ['widget-circle.component.scss'],
})
export class WidgetCircleComponent {

    _widget: SnPageWidgetDto;
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
    }
}
