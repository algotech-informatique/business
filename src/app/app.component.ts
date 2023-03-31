import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { I18nService } from '@algotech-ce/angular';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { from } from 'rxjs';
import { environment } from '../environments/environment';
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    constructor(
        private platform: Platform,
        private i18nService: I18nService,
        protected http: HttpClient,
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            from(SplashScreen.hide()).subscribe();
        });
        this.initializeTrackers();
    }

    initializeTrackers() {
        try {

        } catch (error) {
            console.error('initializeTrackers', error);
        }
    }

    ngOnInit() {
        this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);
    }
}
