import { Observable } from 'rxjs';
import { WorkflowInstanceDto } from '@algotech/core';
import { InterpretorValidateDto } from '../../../../../interpretor/src/dto';
import { InterpretorTaskDto } from '../../../../../interpretor/src/dto';
import { InterpretorJumpDto } from '../../../../../interpretor/src/dto';

export interface TaskService {
    execute(task: InterpretorTaskDto, instance: WorkflowInstanceDto): Observable<InterpretorValidateDto |
        InterpretorJumpDto>;
}
