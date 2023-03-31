import { PipesModule } from '@algotech-ce/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { EndWorkflowComponent } from './end-workflow.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
    ],
    declarations: [
        EndWorkflowComponent,
    ],
    exports: [
        EndWorkflowComponent,
    ]
})
export class EndWorkflowModule { }