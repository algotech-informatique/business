import { SnPageWidgetDto, ApplicationModelDto } from '@algotech/core';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { ThemeEngloberService } from '../../../../theme-englober/theme-englober.service';
import { EventData } from '../../../models';
import { Widget } from '../widget.interface';
import * as _ from 'lodash';

@Component({
    selector: 'widget-button',
    templateUrl: './widget-button.component.html',
    styleUrls: ['widget-button.component.scss'],
})
export class WidgetButtonComponent implements Widget {

    @ViewChild('content') button: ElementRef;
    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();

    activeColor;
    hoverColor;

    constructor(private themeEnglober: ThemeEngloberService, private ref: ChangeDetectorRef) { }

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
        this.ref.detectChanges();
        let bg = this._widget.css.button['background-color'];
        if (this.button && _.isString(bg) && bg.startsWith('var')) {
            bg = getComputedStyle(this.button.nativeElement).getPropertyValue(bg.split('(')[1].split(')')[0]);
        }

        this.activeColor = this.themeEnglober.lightenDarkenColor(bg, 40);
        this.hoverColor = this.themeEnglober.lightenDarkenColor(bg, 45);
    }

    onClick(UIEvent: Event) {
        this.event.emit({ key: 'onClick', UIEvent });
    }
}
