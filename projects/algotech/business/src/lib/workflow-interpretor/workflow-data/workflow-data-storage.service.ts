
import { Injectable } from '@angular/core';
import { WorkflowInstanceDto } from '@algotech/core';
import { Observable, of } from 'rxjs';
import { DataService } from '@algotech/angular';
import * as _ from 'lodash';

const PREFIX_WORKFLOW_INSTANCE = 'wfi';

@Injectable()
export class WorkflowDataStorageService {
    constructor(private dataService: DataService) {
    }

    public getInstance(uuid: string): Observable<WorkflowInstanceDto> {
        return this.dataService.get(PREFIX_WORKFLOW_INSTANCE, uuid);
    }

    public save(instance: WorkflowInstanceDto): Observable<any> {
        if (!this.dataService.mobile) {
            return of(null);
        }
        return this.dataService.save(_.omit(instance, ['context']), PREFIX_WORKFLOW_INSTANCE, instance.uuid);
    }

    public removeInstance(uuid: string) {
        if (!this.dataService.mobile) {
            return of(null);
        }
        return this.dataService.remove(PREFIX_WORKFLOW_INSTANCE, uuid);
    }
}
