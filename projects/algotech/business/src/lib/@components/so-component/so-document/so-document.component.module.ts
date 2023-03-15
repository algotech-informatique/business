import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SoDocumentComponent } from './so-document.component';
import { DocSOFilesService } from './so-document.service';
import { SoInputModule } from '../so-input/so-input.module';
import { FileComponent } from './file-component/file.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SoInputModule,
    ],
    declarations: [
        SoDocumentComponent,
        FileComponent
    ],
    exports: [
        SoDocumentComponent,
        FileComponent
    ],
    providers: [
        DocSOFilesService
    ]
})
export class SoDocumentModule { }
