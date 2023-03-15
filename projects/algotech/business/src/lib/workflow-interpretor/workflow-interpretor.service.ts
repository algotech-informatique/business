
import { Injectable } from '@angular/core';
import { WorkflowReaderService } from './workflow-reader/workflow-reader.service';
import { WorkflowUtilsService } from './workflow-utils/workflow-utils.service';
import { WorkflowDataService } from './workflow-data/workflow-data.service';
import { WorkflowSaveService } from './workflow-save/workflow-save.service';
import { Interpretor } from '../../../interpretor/src/interpretor';
import { WorkflowSoService } from './workflow-reader/workflow-so/workflow-so.service';
import { WorkflowSubjectService } from './workflow-subject/workflow-subject.service';
import { WorkflowMetricsService } from './workflow-metrics/workflow-metrics.service';

@Injectable()
export class WorkflowInterpretorService extends Interpretor {
    constructor(
        protected workflowSoService: WorkflowSoService,
        protected workflowReaderService: WorkflowReaderService,
        protected workflowUtilsService: WorkflowUtilsService,
        protected workflowDataService: WorkflowDataService,
        protected workflowSaveService: WorkflowSaveService,
        protected workflowMetrics: WorkflowMetricsService) {

        super(workflowSoService, workflowReaderService, workflowUtilsService, workflowDataService, workflowSaveService, workflowMetrics);
    }
}
