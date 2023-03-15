import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../@pipes/pipes.module';
import { TaskTagsModule } from '../tags/task-tags.module';
import { AnnotationDetailComponent } from './annotation-detail/annotation-detail.component';
import { AnnotationComponent } from './annotation.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TaskTagsModule,
        PipesModule
    ],
    exports: [
        AnnotationComponent
    ],
    declarations: [
        AnnotationComponent,
        AnnotationDetailComponent,
    ],
    providers: [],
})
export class AnnotationModule { }
