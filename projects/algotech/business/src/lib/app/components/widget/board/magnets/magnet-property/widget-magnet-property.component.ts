import { SmartPropertyObjectDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'at-widget-magnet-property',
  templateUrl: './widget-magnet-property.component.html',
  styleUrls: ['widget-magnet-property.component.scss'],
})
export class WidgetMagnetPropertyComponent {

    @Input() widget: SnPageWidgetDto;
    @Input() properties: SmartPropertyObjectDto[];

}
