import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TaskPlayerModule } from './task-player/task-player.module';
import { WorkflowContainerComponent } from './workflow-container.component';
import { PipesModule,
} from '@algotech/angular';
import { HttpClientModule } from '@angular/common/http';
import { TaskCustomService } from './task-player/task-custom/task-custom.service';
import { WorkflowLaunchService } from '../workflow-launcher/workflow-layout.lancher.service';
import { WorkflowLauncherComponent } from '../workflow-launcher/workflow.launcher.component';
import { WorkflowInterpretorModule } from '../workflow-interpretor/workflow-interpretor.module';
import { EndWorkflowModule } from '../@components/end-workflow/end-workflow.module';
import { WorkflowDialogModule } from '../workflow-dialog/workflow-dialog.module';
import { PopoverModule } from '../@components/popover/popover.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        TranslateModule,
        TaskPlayerModule,
        PipesModule,
        WorkflowInterpretorModule,
        EndWorkflowModule,
        PopoverModule,
        WorkflowDialogModule.forRoot(),
    ],
    providers: [
        WorkflowLaunchService,
        TaskCustomService,
    ],
    declarations: [WorkflowContainerComponent, WorkflowLauncherComponent],
    exports: [WorkflowContainerComponent]
})
export class WorkflowContainerModule { }
