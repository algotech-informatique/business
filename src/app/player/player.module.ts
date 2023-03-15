import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { PlayerPage } from './player.page';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowSyncModule, WorkflowDebuggerModule } from '../../../projects/algotech/business/public_api';
import { DrawingModule } from '../../../projects/algotech/business/drawing/src/drawing.module';

const routes: Routes = [
  {
    path: '',
    component: PlayerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    WorkflowDebuggerModule,
    WorkflowSyncModule.forRoot(),
    DrawingModule.forRoot(),
  ],
  declarations: [PlayerPage],
  exports: []
})
export class PlayerPageModule {}
