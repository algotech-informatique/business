import { Injectable } from '@angular/core';
import { Subject, throwError, Observable, of } from 'rxjs';
import { mergeMap, first, tap, catchError } from 'rxjs/operators';
import { WorkflowInstanceDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { WorkflowDataService } from '../workflow-data/workflow-data.service';
import { WorkflowSubjectService } from '../workflow-subject/workflow-subject.service';
import { WorkflowErrorSynchronize } from '../../../../interpretor/src/error/interpretor-error';
import { InterpretorSave } from '../../../../interpretor/src/interpretor-save/interpretor-save';
import { WorkflowMetricsService } from '../workflow-metrics/workflow-metrics.service';
import { InterpretorMetricsKeys } from '../../../../interpretor/src';

@Injectable()
export class WorkflowSaveService extends InterpretorSave {

    constructor(
        private workflowSubjectService: WorkflowSubjectService,
        private workflowDataService: WorkflowDataService,
        private workflowMetrics: WorkflowMetricsService,) {
        super();
    }

    private savedUuid = null;
    private activeSave: Observable<any>;
    private onSaveFinished: Subject<any> = new Subject();

    public synchronize(wfiUuid: string) {
        return this.workflowDataService.getLocalInstance(wfiUuid).pipe(
            mergeMap((wfi: WorkflowInstanceDto) => {
                if (!wfi) {
                    return throwError(new WorkflowErrorSynchronize('ERR-139', `{{ALREADY-SAVED}}`));
                }

                if (wfi.uuid === this.savedUuid) {
                    return throwError(new WorkflowErrorSynchronize('ERR-140', `${wfi.uuid} {{IS-BEING-SAVED}}`));
                }

                if (!this.isCompleted(wfi)) {
                    return throwError(new WorkflowErrorSynchronize('ERR-141', '{{WORKFLOW-NOT-COMPLETED}}'));
                }

                return this.workflowDataService.saveApi(wfi).pipe(
                    first(),
                );
            })
        );
    }

    get isSaving() {
        return !!this.savedUuid;
    }

    public isCompleted(instance: WorkflowInstanceDto) {
        return this.workflowDataService.isCompleted(instance);
    }

    public save(instance: WorkflowInstanceDto) {
        const _activeSave = this._save(instance);
        this.activeSave = _activeSave;

        // not allow multiple processes
        if (!this.savedUuid) {
            this.savedUuid = instance.uuid;
            this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorSave);
            this.activeSave.subscribe((instanceCloned: WorkflowInstanceDto) => {

                if (instanceCloned) {
                    // update state "saved" of instance
                    instance.saved = instanceCloned.saved;
                    for (let i = 0; i < instance.stackTasks.length; i++) {
                        const task = instance.stackTasks[i];
                        const taskCloned = instanceCloned.stackTasks[i];
                        if (task.uuid === taskCloned?.uuid && task.finishDate === taskCloned?.finishDate) {
                            task.saved = taskCloned.saved;
                        }
                    }
                }

                this.savedUuid = null;
                this.onSaveFinished.next(null);
                this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorSave);
            });
        } else {
            const _subscribe = this.onSaveFinished.subscribe(() => {
                if (_activeSave === this.activeSave) {
                    this.save(instance);
                }
                _subscribe.unsubscribe();
            });
        }

        return of({});
    }

    /** public for test */
    _save(instance: WorkflowInstanceDto): Observable<any> {
        // save finished state
        const isCompleted = this.isCompleted(instance);

        return this.workflowDataService.save(instance).pipe(
            tap(() => {
                this.workflowSubjectService.next({ action: 'operation', date: new Date(), success: true });

                // finished or wait
                if (isCompleted) {
                    this.workflowSubjectService.next({
                        action: 'operations', date: new Date(), success: true,
                        value: instance
                    });
                    this.workflowSubjectService.debug(instance);
                }
            }),
            catchError((error: Error) => {
                this.workflowSubjectService.next({ action: 'operation', date: new Date(), success: false, error });
                return of(null);
            }));
    }
}
