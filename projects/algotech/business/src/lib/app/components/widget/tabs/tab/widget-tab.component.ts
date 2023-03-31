import { ApplicationModelDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Component, EventEmitter } from '@angular/core';
import { EventData } from '../../../../models';
import { Widget } from '../../widget.interface';

@Component({
    selector: 'widget-tab',
    templateUrl: './widget-tab.component.html',
    styleUrls: ['widget-tab.component.scss'],
})
export class WidgetTabComponent implements Widget {

    parent: SnPageWidgetDto;
    tabsOrientationStartsWithRow = true;
    _widget: SnPageWidgetDto;
    appModel: ApplicationModelDto;
    hoverColor: string;
    selected: string;
    css: any;

    event = new EventEmitter<EventData>();
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
        this.tabsOrientationStartsWithRow = this.parent?.css?.tabs?.['flex-direction']?.startsWith('row');

        const selected = this.parent.custom.selectedTabId === this.widget.custom.tabId;
        this.css = this.parent
            .group.widgets
            .filter((w) => w.typeKey === 'tabModel')
            .find((w) => w.custom.selected === selected)
            ?.css;
    }

    onClick(UIEvent: Event) {
        this.event.emit({ key: 'onClick', UIEvent});
    }
}
