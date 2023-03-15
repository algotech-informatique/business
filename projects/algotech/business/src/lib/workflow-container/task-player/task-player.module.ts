import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TaskPlayerComponent } from './task-player.component';
import { TaskPaginateComponent } from './task-paginate/task-paginate.component';
import { PipesModule } from '@algotech/angular';
import { TaskCustomModule } from './task-custom/task-custom.module';
import { TaskHeaderComponent } from './task-header/task-header.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
        TaskCustomModule,
    ],
    providers: [
    ],
    declarations: [TaskPlayerComponent, TaskPaginateComponent, TaskHeaderComponent],
    exports: [TaskPlayerComponent],
})
export class TaskPlayerModule { }
