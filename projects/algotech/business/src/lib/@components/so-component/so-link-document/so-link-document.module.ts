import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule, DocumentIconDtoService } from '@algotech-ce/angular';
import { SoLinkDocumentComponent } from './so-link-document.component';
import { SoDocumentModule } from '../so-document/so-document.component.module';
import { SoInputModule } from '../so-input/so-input.module';
import { WorkflowDialogModule } from '../../../workflow-dialog/workflow-dialog.module';
import { SpinnerModule } from '../../spinner/spinner.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
        SoDocumentModule,
        SoInputModule,
        WorkflowDialogModule,
        SpinnerModule,
    ],
    providers: [
        DocumentIconDtoService,
    ],
    declarations: [
        SoLinkDocumentComponent,
    ],
    exports: [
        SoLinkDocumentComponent,
    ]
})
export class SoLinkDocumentModule { }
