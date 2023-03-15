
import { Injectable } from '@angular/core';
import { WorkflowUtilsService } from '../../workflow-utils/workflow-utils.service';
import { InterpretorProfiles } from '../../../../../interpretor/src/interpretor-reader/interpretor-profiles/interpretor-profiles';

@Injectable()
export class WorkflowProfilesService extends InterpretorProfiles {
    constructor(
        protected workflowUtils: WorkflowUtilsService) {
        super(workflowUtils);
    }
}
