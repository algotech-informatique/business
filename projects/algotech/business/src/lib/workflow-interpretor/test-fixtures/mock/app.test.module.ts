import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
    ATAngularModule, EnvService, AuthService, AuthModule,
} from '@algotech/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkflowContainerModule } from '../../../workflow-container/workflow-container.module';
import { environment } from '../../../../../../../../src/environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthMockService } from './auth.mock.service';
import { AppModule } from '../../../app/app.module';
import { AppRoutingModule } from '../../../../../../../../src/app/app-routing.module';

export const envInitialize = (
    env: EnvService,
) => async () => await new Promise((resolve) => {
    env.initialize(environment);
    resolve(true);
});

@NgModule({
    declarations: [],
    imports: [
        AppModule,
        BrowserModule,
        CommonModule,
        HttpClientTestingModule,
        ATAngularModule.forRoot(),
        WorkflowContainerModule,
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        AppRoutingModule,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: envInitialize,
            deps: [EnvService],
            multi: true
        },
        { provide: AuthService, useClass: AuthMockService },
        AuthMockService
    ],
    bootstrap: [],
})
export class AppTestModule { }
