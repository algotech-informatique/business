import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EndWorkflowModule } from '../@components/end-workflow/end-workflow.module';
import { WorkflowContainerModule } from '../workflow-container/workflow-container.module';
import { SmartLinkComponent } from './smartlink.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        WorkflowContainerModule,
        EndWorkflowModule,
    ],
    declarations: [SmartLinkComponent],
    exports: [SmartLinkComponent],
})
export class SmartLinkModule { }
