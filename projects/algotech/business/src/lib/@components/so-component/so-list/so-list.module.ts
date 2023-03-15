import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SoListComponent } from './so-list.component';
import { SoItemModule } from '../so-item/so-item.component.module';
import { WorkflowDialogModule } from '../../../workflow-dialog/workflow-dialog.module';
import { SoInputModule } from '../so-input/so-input.module';
import { SpinnerModule } from '../../spinner/spinner.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SoItemModule,
        SoInputModule,
        WorkflowDialogModule,
        SpinnerModule,
    ],
    declarations: [
        SoListComponent,
    ],
    exports: [
        SoListComponent,
    ]
})
export class SoListModule { }
