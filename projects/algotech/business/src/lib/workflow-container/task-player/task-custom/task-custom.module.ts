import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@algotech-ce/angular';
import { TaskCustomComponent } from './task-custom.component';
import { TaskDirective } from './task.directive';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { ReportsService } from '@algotech-ce/angular';

import {
    TaskSelectComponent,
    TaskFormComponent,
    TaskMultichoiceComponent,
    TaskNotificationComponent,
    TaskReviewComponent,
    TaskUploadComponent,
    TaskListComponent,
    TaskDownloadComponent,
    TaskDownloadService,
    TaskCameraComponent,
    TaskQRCodeReaderComponent,
    TaskInputCaptureComponent,
    TaskSiteLocationComponent,
    TaskAlertService,
    TaskEditDocumentComponent,
    TaskFileViewerComponent,
    TaskDocumentListComponent,
    TaskObjectCreateUIComponent,
    TaskScheduleCreateComponent,
    TaskGeolocationComponent,
    TaskGeolocationService,
    TaskAutoPhotoComponent,
    TaskAutoPhotoService,
    TaskListLinkDocComponent,
    TaskDocumentSelectComponent,
} from './index-tasks';
import { TaskSignatureComponent } from './ui/task-signature/task-signature.component';
import { TaskTransitionsComponent } from './ui/common/transitions/task.transitions.component';
import { SoComponentModule } from '../../../@components/so-component/so-component.module';
import { TaskTagsModule } from '../../../@components/tags/task-tags.module';
import { TaskCameraService } from './ui/@services/task-camera.service';
import { TaskSiteLocationService } from './ui/@services/task-site-location.service';
import { SoDocumentModule } from '../../../@components/so-component/so-document/so-document.component.module';
import { TaskMetadatasModule } from '../../../@components/metadatas/task-metadatas.module';
import { SoInputModule } from '../../../@components/so-component/so-input/so-input.module';
import { AnnotationModule } from '../../../@components/annotations/annotation.module';
import { SpinnerModule } from '../../../@components/spinner/spinner.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TranslateModule,
        PipesModule,
        NgxDropzoneModule,
        SoComponentModule,
        TaskTagsModule,
        TaskMetadatasModule,
        SoDocumentModule,
        SoInputModule,
        AnnotationModule,
        SpinnerModule
    ],
    providers: [
        TaskDownloadService,
        TaskAlertService,
        TaskGeolocationService,
        TaskAutoPhotoService,
        ReportsService,
        TaskCameraService,
        TaskSiteLocationService,
    ],
    declarations: [
        TaskTransitionsComponent,
        TaskFormComponent,
        TaskMultichoiceComponent,
        TaskCustomComponent,
        TaskDirective,
        TaskSelectComponent,
        TaskNotificationComponent,
        TaskReviewComponent,
        TaskUploadComponent,
        TaskListComponent,
        TaskDownloadComponent,
        TaskCameraComponent,
        TaskQRCodeReaderComponent,
        TaskSignatureComponent,
        TaskInputCaptureComponent,
        TaskSiteLocationComponent,
        TaskFileViewerComponent,
        TaskDocumentListComponent,
        TaskEditDocumentComponent,
        TaskObjectCreateUIComponent,
        TaskScheduleCreateComponent,
        TaskGeolocationComponent,
        TaskAutoPhotoComponent,
        TaskListLinkDocComponent,
        TaskDocumentSelectComponent,
    ],
    exports: [
        TaskCustomComponent
    ],
})
export class TaskCustomModule { }
