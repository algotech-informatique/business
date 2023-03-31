import { SnPageWidgetDto } from '@algotech-ce/core';
import { Component, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'widget-polyline',
  templateUrl: './widget-polyline.component.html',
  styleUrls: ['widget-polyline.component.scss'],
})
export class WidgetPolylineComponent implements OnChanges {

  _widget: SnPageWidgetDto;
  get widget(): SnPageWidgetDto { return this._widget; }
  set widget(value: SnPageWidgetDto) {
    this._widget = value;
    this.onChanges();
  }

  onChanges() {
  }

  ngOnChanges(changes: SimpleChanges): void {

  }
}
