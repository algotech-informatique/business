import { Injectable } from '@angular/core';
import { InterpretorSo } from '../../../../../interpretor/src/interpretor-reader/interpretor-so/interpretor-so';
import { WorkflowAbstractService } from '../../workflow-abstract/workflow-abstract.service';
import { SoUtilsService } from '../../@utils/so-utils.service';

@Injectable()
export class WorkflowSoService extends InterpretorSo {
    constructor(
        protected soUtils: SoUtilsService,
        protected workflowAbstract: WorkflowAbstractService) {
        super(soUtils, workflowAbstract);
    }
}
