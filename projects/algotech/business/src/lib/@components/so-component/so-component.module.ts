import { NgModule } from '@angular/core';
import { SoFormModule } from './so-form/so-form.module';
import { SoListModule } from './so-list/so-list.module';
import { SoLinkDocumentModule } from './so-link-document/so-link-document.module';
import { DocSOFilesService } from './so-document/so-document.service';
import { SoDocumentModule } from './so-document/so-document.component.module';

@NgModule({
    imports: [
        SoFormModule,
        SoListModule,
        SoLinkDocumentModule,
        SoDocumentModule,
    ],
    providers: [
        DocSOFilesService,
    ],
    exports: [
        SoFormModule,
        SoListModule,
        SoLinkDocumentModule,
    ],
})
export class SoComponentModule { }
