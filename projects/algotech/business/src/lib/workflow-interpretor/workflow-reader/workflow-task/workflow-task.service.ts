
import { Injectable } from '@angular/core';
import { WorkflowServiceService } from './workflow-service.service';
import { InterpretorTask } from '../../../../../interpretor/src/interpretor-reader/interpretor-task/interpretor-task';
import { WorkflowProfilesService } from '../workflow-profiles/workflow-profiles.service';
import { WorkflowAbstractService } from '../../workflow-abstract/workflow-abstract.service';
import { WorkflowUtilsService } from '../../workflow-utils/workflow-utils.service';
import { WorkflowMetricsService } from '../../workflow-metrics/workflow-metrics.service';

@Injectable()
export class WorkflowTaskService extends InterpretorTask {
    constructor(
        protected workflowUtils: WorkflowUtilsService,
        protected workflowServiceService: WorkflowServiceService,
        protected workflowProfilsService: WorkflowProfilesService,
        protected workflowAbstractService: WorkflowAbstractService,
        protected workflowMetricsService: WorkflowMetricsService) {
        super(workflowUtils, workflowServiceService, workflowProfilsService, workflowAbstractService, workflowMetricsService);
    }
}
