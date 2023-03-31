import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoInputComponent } from './so-input.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@algotech-ce/angular';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule
    ],
    declarations: [
        SoInputComponent,
    ],
    exports: [
        SoInputComponent,
    ]
})
export class SoInputModule { }
