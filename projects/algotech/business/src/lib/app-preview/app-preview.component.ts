import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { PairDto, SnAppDto, ApplicationModelDto, SnPageDto, GroupDto } from '@algotech-ce/core';
import { Component, OnInit, OnDestroy, Output, EventEmitter, NgZone } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthService, EnvService, SettingsDataService } from '@algotech-ce/angular';
import * as _ from 'lodash';
import { ToastService } from '../@services/toast.service';
import { Location } from '@angular/common';
import { ThemeEngloberService } from '../theme-englober/theme-englober.service';
import { AuthDebugService } from '../@services/auth.debug.service';

@Component({
    selector: 'app-preview',
    template: `
        <div *ngIf="!snPage" style='height: 100%, width: 100%'>
            <ion-spinner name="dots"></ion-spinner>
        </div>
        <page-layout *ngIf="snPage" [appModel]="appModel" [readonly]="readonly" [snPage]="snPage" [variables]="pageInputs"></page-layout>
    `,
    styleUrls: ['./app-preview.component.scss']
})
export class AppPreviewComponent implements OnInit, OnDestroy {

    appModel: ApplicationModelDto;
    snApp: SnAppDto;
    readonly = false;
    subscription: Subscription;
    pageInputs: PairDto[];
    snPage: SnPageDto;
    @Output() selectedApp = new EventEmitter<ApplicationModelDto>();

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private toastService: ToastService,
        private translate: TranslateService,
        private authDebugService: AuthDebugService,
        private envService: EnvService,
        private settingsDataService: SettingsDataService,
        private themeEnglober: ThemeEngloberService,
        public location: Location,
        private zone: NgZone,
    ) { }

    ngOnInit() {
        this.subscription = this.getRouteParams().subscribe((routeParams) => {
            if (this.settingsDataService.settings) {
                this.getPlayerPreview(routeParams.appKey, routeParams.pageKey);
            } else {
                this.getStudioPreview(routeParams.pageKey);
            }
        });
    }

    private getRouteParams(): Observable<{appKey: string, pageKey: string}> {
        return this.route.params.pipe(
            map((params: Params) => {
                const appKey: string = params['keyApp'];
                const pageKey = params['keyPage'];
                let inputs: string = params['inputs'];

                if (inputs) {
                    try {
                        inputs = decodeURIComponent(inputs);
                        inputs = decodeURIComponent(window.atob(inputs));
                        this.pageInputs = JSON.parse(inputs);
                    } catch (err) { console.error('ParseError', err); }
                }
                return {appKey, pageKey};
            }),
        );
    }

    private getPlayerPreview(appKey: string, pageKey: string) {
        const app: ApplicationModelDto = appKey ? _.find(this.settingsDataService.apps, { key: appKey }) : null;
        if (app) {
            const authorizedGroup = _.some(this.authService.localProfil.groups, (group: string) =>
                _.some(this.settingsDataService.groups, (g: GroupDto) => {
                    return g.key === group && g.application?.authorized?.indexOf(appKey) > -1;
                })
            );
            this.readonly = app.environment === 'debug';

            if (this.readonly || authorizedGroup) {
                this.appModel = app;
                this.snApp = app.snApp;
                this.selectedApp.emit(this.appModel);

                // !!!! attention ici il s'agit de l'uuid de la page !!!! \\
                // !!!! il faudra remplacer par la key de la page    !!!! \\
                this.snPage = _.cloneDeep(this.findPage(pageKey));

                return;
            }
        }
        this.toastService.presentToastWithOptions(
            this.translate.instant('SIGNIN.FAILED_UNAUTHORIZED_WARNING'),
            this.translate.instant('SIGNIN.FAILED_UNAUTHORIZED_MSG'),
            'top',
        );
    }

    private getStudioPreview(pageKey: string) {
        this.readonly = true;
        window.addEventListener('message', (e) => {
            this.zone.run(() => {
                if (e.origin !== window.location.origin) { return; }
                if (!e.data.environment) { return; }

                this.envService.setEnvironment(e.data.environment, e.data.localProfil);
                this.authDebugService.overrideGetterLocalProfil(e.data.localProfil).subscribe(() => {
                    this.settingsDataService.glists = e.data.glists;
                    this.settingsDataService.groups = e.data.groups;
                    this.settingsDataService.settings = e.data.settings;
                    this.settingsDataService.smartmodels = e.data.smartmodels;
                    this.settingsDataService.workflows = e.data.workflows;
                    this.settingsDataService.tags = e.data.tags;
                    this.settingsDataService.apps = e.data.apps;
            
                    this.appModel = e.data.appModel;
                    for (const app of [...this.settingsDataService.apps, this.appModel]) {
                        app.environment = 'debug';
                    }

                    this.snApp = e.data.snApp;
                    this.themeEnglober.theme.next(this.snApp.theme);
                    this.snPage = this.findPage(pageKey);
                });
            });
        }, false);
        window.opener.postMessage('pageLoaded', window.location.origin);
    }

    private findPage(pageKey: string): SnPageDto {
        const pageCalled = _.find(this.snApp.pages, { id: pageKey });
        const pageMain = _.find(this.snApp.pages, { main: true });
        const pageFirst = this.snApp.pages[0];
        return pageCalled || pageMain || pageFirst;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
