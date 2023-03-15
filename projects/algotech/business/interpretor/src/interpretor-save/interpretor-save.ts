import { WorkflowInstanceDto } from '@algotech/core';
import { Observable } from 'rxjs';
export abstract class InterpretorSave {
    abstract save(instance: WorkflowInstanceDto): Observable<any>;
}
