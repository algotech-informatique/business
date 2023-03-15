import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SoItemComponent } from './so-item.component';
import { SoInputModule } from '../so-input/so-input.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        SoInputModule,
    ],
    declarations: [
        SoItemComponent,
    ],
    exports: [
        SoItemComponent,
    ]
})
export class SoItemModule { }
