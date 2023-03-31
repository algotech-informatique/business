import { NgModule } from '@angular/core';
import { TaskTagsComponent } from './task-tags.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@algotech-ce/angular';
import { CustomPopoverModule } from '../custom-popover/custom-popover.module';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        PipesModule,
        CustomPopoverModule,
    ],
    declarations: [
        TaskTagsComponent,
    ],
    exports: [
        TaskTagsComponent,
    ],
})
export class TaskTagsModule { }
