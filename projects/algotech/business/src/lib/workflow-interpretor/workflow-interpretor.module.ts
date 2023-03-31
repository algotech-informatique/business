import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowInterpretorService } from './workflow-interpretor.service';
import { WorkflowReaderService } from './workflow-reader/workflow-reader.service';
import {
    SmartObjectsService, WorkflowInstancesService,
    UsersService, EmailService, PipesModule
} from '@algotech-ce/angular';
import { HttpClientModule } from '@angular/common/http';
import { WorkflowTaskService } from './workflow-reader/workflow-task/workflow-task.service';
import { WorkflowServiceService } from './workflow-reader/workflow-task/workflow-service.service';
import { WorkflowBreadCrumbService } from './workflow-reader/workflow-breadcrumb/workflow-breadcrumb.service';
import { WorkflowUtilsService } from './workflow-utils/workflow-utils.service';
import { WorkflowSoService } from './workflow-reader/workflow-so/workflow-so.service';
import { WorkflowSubjectService } from './workflow-subject/workflow-subject.service';
import { File as FileService } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ReportsUtilsService } from './@utils/reports-utils.service';
import { FilesService } from '../workflow-interpretor/@utils/files.service';
import { WorkflowProfilesService } from './workflow-reader/workflow-profiles/workflow-profiles.service';
import { WorkflowSaveService } from './workflow-save/workflow-save.service';
import { WorkflowDataService } from './workflow-data/workflow-data.service';
import { WorkflowDataApiService } from './workflow-data/workflow-data-api.service';
import { WorkflowDataStorageService } from './workflow-data/workflow-data-storage.service';
import { WorkflowAbstractService } from './workflow-abstract/workflow-abstract.service';
import { ScheduleUtilsService } from './@utils/schedule-utils.service';
import { SkillsUtilsService } from './@utils/skills-utils.service';
import { SoUtilsService } from './@utils/so-utils.service';
import { SysUtilsService } from './@utils/sys-utils.service';
import { TagsUtilsService } from './@utils/tags-utilis.service';
import { SmartFlowUtilsService } from './@utils/smartflow-utils.service';
import { WorkflowMetricsService } from './workflow-metrics/workflow-metrics.service';
import { TaskUtilsService } from './@utils/task-utils.service';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        TranslateModule,
        PipesModule,
    ],
    providers: [
        ReportsUtilsService,
        ScheduleUtilsService,
        SkillsUtilsService,
        SoUtilsService,
        SysUtilsService,
        TagsUtilsService,
        SmartFlowUtilsService,
        TaskUtilsService,
        WorkflowAbstractService,
        WorkflowSaveService,
        WorkflowDataService,
        WorkflowDataApiService,
        WorkflowMetricsService,
        WorkflowDataStorageService,
        WorkflowInstancesService,
        WorkflowInterpretorService,
        WorkflowUtilsService,
        WorkflowBreadCrumbService,
        WorkflowSoService,
        WorkflowTaskService,
        WorkflowReaderService,
        WorkflowProfilesService,
        WorkflowServiceService,
        WorkflowSubjectService,
        FilesService,
        SmartObjectsService,
        UsersService,
        EmailService,
        FileService,
        FileOpener,
    ],
})
export class WorkflowInterpretorModule {
}
