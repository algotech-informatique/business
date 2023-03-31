import { SnPageWidgetDto } from '@algotech-ce/core';
import { Component } from '@angular/core';

@Component({
  selector: 'widget-rectangle',
  templateUrl: './widget-rectangle.component.html',
  styleUrls: ['widget-rectangle.component.scss'],
})
export class WidgetRectangleComponent {

    _widget: SnPageWidgetDto;
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
    }
}
