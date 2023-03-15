import { ApplicationModelDto, SnPageDto, SnPageWidgetDto } from '@algotech/core';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ThemeEngloberService } from '../../../../theme-englober/theme-englober.service';
import * as _ from 'lodash';

@Component({
    selector: 'widget-tabs',
    templateUrl: './widget-tabs.component.html',
    styleUrls: ['widget-tabs.component.scss'],
})
export class WidgetTabsComponent {

    @ViewChild('content') tabsContainer: ElementRef;
    _widget: SnPageWidgetDto;
    appModel: ApplicationModelDto;
    hoverColor: string;
    snPage: SnPageDto;
    readonly: boolean;
    types: Object;
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    constructor(
        private themeEnglober: ThemeEngloberService,
        private ref: ChangeDetectorRef,
    ) { }

    initialize() {
        this.ref.detectChanges();
        let bg = this._widget?.css?.main['background-color'];
        if (this.tabsContainer && _.isString(bg) && bg.startsWith('var')) {
            bg = getComputedStyle(this.tabsContainer.nativeElement).getPropertyValue(bg.split('(')[1].split(')')[0]);
        }
        this.hoverColor = this.themeEnglober.lightenDarkenColor(bg, 40);
    }

}
