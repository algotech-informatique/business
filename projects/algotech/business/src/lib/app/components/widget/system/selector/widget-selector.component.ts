import { SnPageWidgetDto, ApplicationModelDto, GroupDto, SnPageDto } from '@algotech/core';
import { EventData } from '../../../../models';
import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { Widget } from '../../widget.interface';
import { Application, applications, AuthService, DataService, EnvService, SettingsDataService, TranslateLangDtoService } from '@algotech/angular';
import { style, animate, transition, trigger } from '@angular/animations';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
    selector: 'widget-selector',
    templateUrl: './widget-selector.component.html',
    styleUrls: ['widget-selector.component.scss'],
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
export class WidgetSelectorComponent implements Widget {

    @ViewChild('container') container: ElementRef;
    @ViewChild('popup', { static: false, read: ElementRef }) popupHostRef: ElementRef;

    constructor(
        private authService: AuthService,
        private settingsDataService: SettingsDataService,
        private translateLangDtoService: TranslateLangDtoService,
        private router: Router,
        private dataService: DataService,
        private menu: MenuController,
        private env: EnvService
    ) {
        this.env.environment.subscribe((env) => {
            this.storage = env.STORAGE_CONTEXT;
            this.initializeAppSelector();
        })
    }

    storage: string;
    applications: Application[];
    menuAppsOpen = false;

    snPage: SnPageDto;
    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();
    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    initialize() {
        window.addEventListener('click', (e) => {
            if (!document.getElementById('selector')?.contains(e.target as Node)) {
                this.menuAppsOpen = false;
            }
        });
    }

    initializeAppSelector() {

        this.applications = _.orderBy(
            _.uniqBy(
                _.flatten(this.authService.localProfil.groups
                    .map((groupKey: string) => _.find(this.settingsDataService.groups, { key: groupKey }))
                    .map((group: GroupDto) => _.reduce(group?.application?.authorized, (res: any[], appKey: string) => {
                        const app: ApplicationModelDto = _.find(this.settingsDataService.apps, { key: appKey });
                        if (app?.environment === 'web') {
                            res.push({
                                applicationUrl: `/app/${app.key}`,
                                key: app.key,
                                category: 'Apps',
                                groups: app.snApp.securityGroups,
                                id: app.uuid,
                                icon: app.snApp.icon,
                                name: this.translateLangDtoService.transform(app.displayName),
                            });
                        }
                        return res;
                    }, []))
                ),
                'key'),
            'name'
        );

        // FIXME: remove these part of code when plan no longer exists
        if (this.storage === 'plan') {
            this.applications.push(..._.reduce(applications, (results, app) => {
                const allowedGroups = _.intersection(app.groups, this.authService.localProfil.groups);
                if (allowedGroups.length !== 0) {
                    results.push(app);
                }
                return results;
            }, []))
        }
    }

    onClick() {
        if (this.dataService.mobile) {
            this.menu.open('menu-content');
        } else {
            this.menuAppsOpen = !this.menuAppsOpen;
        }
    }

    onSelectedApplication(applicationUrl: string) {
        history.pushState({}, '', window.location.href);
        this.router.navigateByUrl(applicationUrl, { replaceUrl: true });
        this.menuAppsOpen = false;
    }
}