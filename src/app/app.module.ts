import { AppPreviewModule } from '../../projects/algotech/business/src/lib/app-preview/app-preview.module';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import {
    I18nService,
    GestionDisplaySettingsService, GeoLocationModule, ATAngularModule,
    EnvService, SocketModule, AuthService, AuthModule, SignInGuard
} from '@algotech-ce/angular';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    EncodeGuard,
    SmartLinkModule, WorkflowDebuggerModule
} from '../../projects/algotech/business/public_api';
import { SoFormService } from '../../projects/algotech/business/src/lib/@components/so-component/so-form/so-form.service';
import { ThemeEngloberModule } from '../../projects/algotech/business/public_api';
import { AppViewerPage } from './app/app-viewer.module';
import { KeycloakAngularModule } from 'keycloak-angular';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';

export const envInitialize = (
    env: EnvService,
    authService: AuthService,
) => async () => await new Promise((resolve) => {
    env.initialize(environment);
    authService.appId = environment.APP_ID;
    authService.initialize('pwa-player', window.location.origin, environment.KC_URL).pipe(
    ).subscribe(() => {
        resolve(true);
    });
});

@NgModule({
    declarations: [AppComponent],
    imports: [
        AuthModule,
        AppViewerPage,
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        TranslateModule,
        GeoLocationModule,
        SocketModule,
        WorkflowDebuggerModule,
        ATAngularModule.forRoot(),
        AppPreviewModule,
        SmartLinkModule,
        KeycloakAngularModule,
        ThemeEngloberModule,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: envInitialize,
            deps: [EnvService, AuthService],
            multi: true
        },
        {
            provide: APP_BASE_HREF,
            useFactory: (s: PlatformLocation) => s.getBaseHrefFromDOM(),
            deps: [PlatformLocation]
        },
        I18nService,
        GestionDisplaySettingsService,
        SoFormService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        SignInGuard,
        EncodeGuard,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
