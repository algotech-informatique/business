import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Application } from '@algotech-ce/angular';
import { style, animate, transition, trigger } from '@angular/animations';
import * as _ from 'lodash';
import { SnPageBoxDto, SnPageDto, SnPageWidgetDto } from '@algotech-ce/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'widget-popup-selector',
  templateUrl: './selector-popup.component.html',
  styleUrls: ['selector-popup.component.scss'],
  animations: [
    trigger('fadeInOut', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate(250, style({ opacity: 1 }))
        ]),
        transition(':leave', [animate(500, style({ opacity: 0 }))])
    ])
]
})
export class SelectorPopupComponent implements AfterViewInit {

    @ViewChild('container') container: ElementRef;

    @Input() applications: Application[];
    @Input() widget: SnPageWidgetDto;
    @Input() snPage: SnPageDto;

    selectedAppId: string;
    @Output() selectedApp = new EventEmitter<string>();

    constructor(private route: ActivatedRoute) 
    { }

    ngAfterViewInit() {
        const pageKey: string =  this.route.snapshot.paramMap.get('keyApp');
        if (pageKey) {
            this.selectedAppId = _.find(this.applications, { key: pageKey })?.id;
        }
    }

    appClick(applicationUrl: string) {
        this.selectedAppId = this.applications.find(app => app.applicationUrl === applicationUrl).id;
        this.selectedApp.emit(applicationUrl);
    }
}