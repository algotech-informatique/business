
import { Injectable } from '@angular/core';
import { WorkflowProfilesService } from './workflow-profiles/workflow-profiles.service';
import { WorkflowTaskService } from './workflow-task/workflow-task.service';
import { WorkflowUtilsService } from '../workflow-utils/workflow-utils.service';
import { WorkflowBreadCrumbService } from './workflow-breadcrumb/workflow-breadcrumb.service';
import { WorkflowSoService } from './workflow-so/workflow-so.service';
import { WorkflowSubjectService } from '../workflow-subject/workflow-subject.service';
import { InterpretorReader } from '../../../../interpretor/src/interpretor-reader/interpretor-reader';
import { WorkflowAbstractService } from '../workflow-abstract/workflow-abstract.service';
import { WorkflowMetricsService } from '../workflow-metrics/workflow-metrics.service';

@Injectable()
export class WorkflowReaderService extends InterpretorReader {

    constructor(
        protected workflowProfilService: WorkflowProfilesService,
        protected workflowTaskService: WorkflowTaskService,
        protected workflowBreadCrumbService: WorkflowBreadCrumbService,
        protected workflowUtilsService: WorkflowUtilsService,
        protected workflowSoService: WorkflowSoService,
        protected workflowSubjectService: WorkflowSubjectService,
        protected workflowAbstractService:  WorkflowAbstractService,
        protected workflowMetricsService: WorkflowMetricsService) {

        super(workflowProfilService, workflowTaskService, workflowBreadCrumbService,
            workflowUtilsService, workflowSoService, workflowAbstractService, workflowMetricsService, workflowSubjectService);
    }
}
