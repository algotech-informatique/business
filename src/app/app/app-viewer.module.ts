import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowSyncModule, WorkflowDebuggerModule, AppModule } from '../../../projects/algotech/business/public_api';
import { DrawingModule } from '../../../projects/algotech/business/drawing/src/drawing.module';
import { AppViewerPageComponent } from './app-viewer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    WorkflowDebuggerModule,
    WorkflowSyncModule.forRoot(),
    DrawingModule.forRoot(),
    AppModule,
  ],
  declarations: [AppViewerPageComponent]
})
export class AppViewerPage {}
