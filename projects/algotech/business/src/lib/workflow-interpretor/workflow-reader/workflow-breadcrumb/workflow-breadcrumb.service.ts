import { WorkflowUtilsService } from '../../workflow-utils/workflow-utils.service';
import { Injectable } from '@angular/core';
import { InterpretorBreadCrumb } from '../../../../../interpretor/src/interpretor-reader/interpretor-breadcrumb/interpretor-breadcrumb';

@Injectable()
export class WorkflowBreadCrumbService extends InterpretorBreadCrumb {

    constructor(protected workflowUtils: WorkflowUtilsService) {
        super(workflowUtils);
    }
}
