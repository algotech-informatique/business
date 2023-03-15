// tslint:disable-next-line: max-line-length
import { ComboboxListComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-combobox/combobox-list/combobox-list.component';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputComboboxComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-combobox/so-form-property-input-combobox.component';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputDropdownComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-dropdown/so-form-property-input-dropdown.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule, SmartObjectsService, KeyFormaterService, DirectivesModule } from '@algotech/angular';
import { SoFormService } from './so-form.service';
import { SoFormObjectComponent } from './so-form-object/so-form-object.component';
import { SoFormComponent } from './so-form-component';
import { SoFormMultipleComponent } from './so-form-multiple/so-form-multiple.component';
import { SoFormPropertyInputComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input.component';
import { SoFormPropertyComponent } from './so-form-object/so-form-property/so-form-property.component';
import { SoFormDirective } from './so-form.directive';
import { SoItemModule } from '../so-item/so-item.component.module';
import { SoListModule } from '../so-list/so-list.module';
import { SoLinkDocumentModule } from '../so-link-document/so-link-document.module';
import { SoFormSearchComponent } from './so-form-search/so-form-search.component';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputGListComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-glist/so-form-property-input-glist.component';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputPhotoComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-photo/so-form-property-input-photo.component';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputPhotoViewerComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-photo/so-form-property-input-photo-viewer/so-form-property-input-photo-viewer.component';
import { SoDocumentModule } from '../so-document/so-document.component.module';
import {
    SoFormPropertyInputBooleanComponent,
} from './so-form-object/so-form-property/so-form-property-input/so-form-property-boolean/so-form-property-input-boolean.component';
import {
    GlistListComponent,
} from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-glist/glist-list/glist-list.component';
import { TaskTagsModule } from '../../tags/task-tags.module';
import { TaskMetadatasModule } from '../../metadatas/task-metadatas.module';
import { SoInputModule } from '../so-input/so-input.module';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputObjectComponent } from './so-form-object/so-form-property/so-form-property-input/so-form-property-input-object/so-form-property-input-object.component';
import { WorkflowDialogModule } from '../../../workflow-dialog/workflow-dialog.module';
import { SpinnerModule } from '../../spinner/spinner.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
        SoInputModule,
        SoItemModule,
        SoListModule,
        SoLinkDocumentModule,
        SoDocumentModule,
        TaskTagsModule,
        TaskMetadatasModule,
        DirectivesModule,
        WorkflowDialogModule,
        SpinnerModule,
    ],
    providers: [
        SmartObjectsService,
        SoFormService,
        KeyFormaterService,
    ],
    declarations: [
        SoFormSearchComponent,
        SoFormDirective,
        SoFormComponent,
        SoFormObjectComponent,
        SoFormPropertyComponent,
        SoFormPropertyInputComponent,
        SoFormPropertyInputPhotoViewerComponent,
        SoFormPropertyInputPhotoComponent,
        SoFormPropertyInputGListComponent,
        SoFormPropertyInputBooleanComponent,
        SoFormPropertyInputObjectComponent,
        SoFormMultipleComponent,
        GlistListComponent,
        SoFormPropertyInputDropdownComponent,
        SoFormPropertyInputComboboxComponent,
        ComboboxListComponent,
    ],
    exports: [
        SoFormComponent,
        SoFormPropertyInputObjectComponent
    ]
})
export class SoFormModule { }
