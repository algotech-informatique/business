import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CustomOptionListComponent } from './custom-option-list/custom-option-list.component';
import { CustomTagsPopoverComponent } from './custom-tags-popover/custom-tags-popover.component';
import { PipesModule } from '@algotech-ce/angular';
import { SoInputModule } from '../so-component/so-input/so-input.module';
import { CustomOptionEditorComponent } from './custom-editor/custom-editor.component';
import { CustomColorComponent } from './custom-color/custom-color.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
        SoInputModule,
    ],
    declarations: [
        CustomOptionListComponent,
        CustomTagsPopoverComponent,
        CustomOptionEditorComponent,
        CustomColorComponent,
    ],
})
export class CustomPopoverModule { }
