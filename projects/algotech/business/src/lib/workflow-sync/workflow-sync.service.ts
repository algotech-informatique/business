import { Injectable, Inject } from '@angular/core';
import { DataService } from '@algotech/angular';
import { WorkflowInstanceDto } from '@algotech/core';
import { map, tap, catchError, mergeMap, finalize, toArray } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable, concat, throwError, of } from 'rxjs';
import { WorkflowSaveService } from '../workflow-interpretor/workflow-save/workflow-save.service';

@Injectable()
export class WorkflowSyncService {

    public isSynchronizing = false;

    constructor(
        private dataService: DataService,
        private workflowSaveService: WorkflowSaveService) { }

    getInstances(): Observable<WorkflowInstanceDto[]> {
        return this.dataService.getAll<WorkflowInstanceDto>('wfi').pipe(
            map((wfis: WorkflowInstanceDto[]) => {
                const res: WorkflowInstanceDto[] = _.orderBy(
                    _.filter(
                        wfis,
                        (wfi) => this.workflowSaveService.isCompleted(wfi)
                    ),
                    'updateDate', 'asc'
                );
                return res;
            })
        );
    }

    synchronize(error?: (err: Error) => void, success?: (instances: WorkflowInstanceDto[]) => void) {
        if (this.isSynchronizing) {
            return ;
        }

        this.isSynchronizing = true;

        return this.getInstances().pipe(
            mergeMap((instances: WorkflowInstanceDto[]) => {
                return concat(..._.map(instances, (wfi) => {
                    return of({}).pipe(mergeMap(() => this.workflowSaveService.synchronize(wfi.uuid)));
                })).pipe(
                    toArray(),
                    catchError((e) => {
                        if (error) {
                            error(e);
                        }
                        return throwError(e);
                    }),
                    tap((instances: WorkflowInstanceDto[]) => {
                        if (success) {
                            success(instances);
                        }
                    }),
                    finalize(() => this.isSynchronizing = false)
                );
            })
        ).subscribe();
    }
}
