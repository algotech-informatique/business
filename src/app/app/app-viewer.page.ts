import { Component, OnInit } from '@angular/core';
import { AuthService, DataService, LoaderService, NetworkService, SettingsDataService, SocketManager } from '@algotech/angular';
import { ActivatedRoute, ActivatedRouteSnapshot, Params, Router } from '@angular/router';
import { ApplicationModelDto, GroupDto, PairDto, SnAppDto, SnPageDto } from '@algotech/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { SysUtilsService, ThemeEngloberService, WorkflowLaunchService } from '../../../projects/algotech/business/public_api';

@Component({
    selector: 'app-viewer',
    templateUrl: './app-viewer.page.html',
    styleUrls: ['./app-viewer.page.scss']
})
export class AppViewerPageComponent implements OnInit {

    // appKey = 'test-planning';
    appKey = 'test_tableau';

    snPage: SnPageDto;
    snApp: SnAppDto;
    appModel: ApplicationModelDto;
    readonly = false;
    pageInputs: PairDto[];

    constructor(
        private loader: LoaderService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private settingsDataService: SettingsDataService,
        private workflowLaunchService: WorkflowLaunchService,
        private sysUtilsService: SysUtilsService,
        private themeEngloberService: ThemeEngloberService,
        private socket: SocketManager,
        private dataService: DataService,
    ) { }

    ngOnInit() {
        if (!this.settingsDataService.settings) {
            this.dataService.mobile = false;
            this.workflowLaunchService.setCurrentUser();
            this.loader.Initialize().subscribe(() => {
                this.socket.start();
                // this.dataService.networkService.offline = true;
                this.getPagePreview();
            });
        } else {
            this.getPagePreview();
        }
    }

    getPagePreview() {
        const app: ApplicationModelDto = this.appKey ? _.find(this.settingsDataService.apps, { key: this.appKey }) : null;
        if (app) {
            if (app.snApp?.theme) {
                this.themeEngloberService.theme.next(app.snApp.theme);
            }
            this.appModel = app;
            this.snApp = app.snApp;
            const pageMain = _.find(this.snApp.pages, { main: true });
            const pageFirst = this.snApp.pages[0];
            this.snPage = _.cloneDeep(pageMain || pageFirst);

            return;
        }
    }
}
