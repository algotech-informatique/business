import { NgModule } from '@angular/core';
import { TaskMetadatasComponent } from './task-metadatas.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@algotech/angular';
import { FormsModule } from '@angular/forms';
import { SoInputModule } from '../so-component/so-input/so-input.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
        SoInputModule,
    ],
    declarations: [
        TaskMetadatasComponent,
    ],
    exports: [
        TaskMetadatasComponent,
    ],
})
export class TaskMetadatasModule { }
