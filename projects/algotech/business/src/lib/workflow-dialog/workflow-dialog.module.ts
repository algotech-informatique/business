import { WorkflowDialogComponent } from '../workflow-dialog/workflow-dialog.component';
import { WorkflowDialogService } from './workflow-dialog.service';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '@algotech-ce/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerModule } from '../@components/spinner/spinner.module';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        PipesModule,
        SpinnerModule
    ],
    providers: [
        WorkflowDialogService
    ],
    declarations: [WorkflowDialogComponent],
    exports: [WorkflowDialogComponent]
})
export class WorkflowDialogModule {

    public static forRoot(): ModuleWithProviders<WorkflowDialogModule> {
        return {
            ngModule: WorkflowDialogModule,
            providers: [
                WorkflowDialogService
            ]
        };
    }
}
