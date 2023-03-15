import { Injectable } from '@angular/core';
import { ScheduleUtils } from '../../../../interpretor/src';
import { WorkflowAbstractService } from '../workflow-abstract/workflow-abstract.service';

@Injectable()
export class ScheduleUtilsService extends ScheduleUtils {
    constructor(protected workflowAbstractServie:  WorkflowAbstractService) {
        super(workflowAbstractServie);
    }
}
