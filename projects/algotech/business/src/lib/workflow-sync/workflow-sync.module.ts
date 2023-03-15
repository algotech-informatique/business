import { NgModule, ModuleWithProviders } from '@angular/core';
import { WorkflowSyncComponent } from './workflow-sync.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowInstanceCardComponent } from './sync/workflow-instance-card.component';
import { PipesModule } from '@algotech/angular';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowSyncService } from './workflow-sync.service';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        PipesModule,
        TranslateModule,
    ],
    declarations: [WorkflowInstanceCardComponent, WorkflowSyncComponent],
    exports: [WorkflowSyncComponent]
})
export class WorkflowSyncModule {
    public static forRoot(): ModuleWithProviders<WorkflowSyncModule> {
        return {
            ngModule: WorkflowSyncModule,
            providers: [
                WorkflowSyncService
            ]
        };
    }
}
