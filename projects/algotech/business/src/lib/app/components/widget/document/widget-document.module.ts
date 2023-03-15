import { PipesModule as AngularPipesModule } from '@algotech/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AnnotationModule } from '../../../../@components/annotations/annotation.module';
import { SoDocumentModule } from '../../../../@components/so-component/so-document/so-document.component.module';
import { SoInputModule } from '../../../../@components/so-component/so-input/so-input.module';
import { PipesModule } from '../../../../@pipes/pipes.module';
import { WidgetDocumentBaseComponent } from './base/widget-document-base.component';
import { WidgetDocumentGridComponent } from './grid/widget-document-grid.component';
import { WidgetDocumentInformationComponent } from './information/widget-document-information.component';
import { WidgetDocumentListComponent } from './list/widget-document-list.component';
import { UnhiddenFilesPipe } from './pipes/unhidden-files.pipe';
import { WidgetDocumentComponent } from './widget-document.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SoDocumentModule,
        AngularPipesModule,
        PipesModule,
        SoInputModule,
        AnnotationModule,
    ],
    exports: [
        WidgetDocumentComponent,
        WidgetDocumentBaseComponent
    ],
    declarations: [
        WidgetDocumentComponent,
        WidgetDocumentBaseComponent,
        WidgetDocumentListComponent,
        WidgetDocumentGridComponent,
        WidgetDocumentInformationComponent,
        UnhiddenFilesPipe,
    ],
    providers: [
        UnhiddenFilesPipe,
    ],
})
export class WidgetDocumentModule { }