import {
    WorkflowInstanceDto, WorkflowModelDto,
    WorkflowStackTaskDto, WorkflowOperationDto, WorkflowInstanceContextDto
} from '@algotech/core';
import { Observable, throwError, concat, of, defer } from 'rxjs';
import { mergeMap, catchError, toArray, tap, map, first } from 'rxjs/operators';
import * as _ from 'lodash';
import { DownloadDataDto } from '../dto';
import { InterpretorSo } from '../interpretor-reader/interpretor-so/interpretor-so';
import { InterpretorOperations } from '../interpretor-reader/interpretor-operations/interpretor-operations';
import { SaveOperationMode } from '../dto';
import { InterpretorDataApi } from './interpretor-data-api';
import { InterpretorUtils } from '../interpretor-utils/interpretor-utils';

export abstract class InterpretorData {

    constructor(
        protected workflowUtils: InterpretorUtils,
        protected workflowApiService: InterpretorDataApi,
        protected workflowSoService: InterpretorSo) {
    }

    abstract getModel(model: string, context: WorkflowInstanceContextDto): Observable<WorkflowModelDto>;
    abstract getInstance(uuid: string, context: WorkflowInstanceContextDto): Observable<WorkflowInstanceDto>;
    abstract save(instance: WorkflowInstanceDto): Observable<any>;
    abstract saveInstance(instance: WorkflowInstanceDto): Observable<WorkflowInstanceDto>;
    abstract saveFinalOperations(instance: WorkflowInstanceDto): Observable<any>;

    public loadData(instance: WorkflowInstanceDto): Observable<any> {
        instance.smartobjects = [];
        instance.documents = [];

        switch (instance.settings.savingMode) {
            case 'ASAP': {
                return this.workflowSoService.downloadData(instance.data, instance.smartobjects, instance.documents,
                    instance.context.smartmodels, instance.context);
            }
            case 'END':
                return this._reconsituteData(instance);
        }
    }

    public saveApi(instance: WorkflowInstanceDto) {
        if (this.workflowUtils.isReadonly(instance)) {
            return of(instance);
        }
        // api workflow instance save
        return this.saveInstance(instance).pipe(
            mergeMap(() => {
                return this.currentOperationsSave(instance);
            }),
            mergeMap(() => {
                if (instance.settings.savingMode === 'END' && instance.state === 'finished') {
                    return this.saveFinalOperations(instance);
                }
                return of({});
            }),
            map(() => instance),
        );
    }

    public currentOperationsSave(instance: WorkflowInstanceDto): Observable<any> {

        const mode = instance.settings.savingMode === 'ASAP' ?
            SaveOperationMode.Asap : SaveOperationMode.EndForceImmediately;

        // save wholeness operations
        return concat(...
            (
                _.reduce(instance.stackTasks, (results, task: WorkflowStackTaskDto) => {
                    if (!task.saved) {
                        const operations = task.operations.filter((op) => op.saveOnApi);
                        results.push(..._.map(operations, (operation: WorkflowOperationDto) => {
                            return this.workflowApiService.saveOperation(instance, operation, mode).pipe(
                                tap(() => {
                                    task.saved = true;
                                    this.saveStorage(instance);
                                }),
                                first() // force complete for concat
                            );
                        }));
                    }
                    return results;
                }, [])
            )
        ).pipe(
            catchError((err) => throwError(err)),
            toArray(),
        );
    }

    public getOperations(instance: WorkflowInstanceDto) {
        return _.reduce(instance.stackTasks, (results, task: WorkflowStackTaskDto) => {
            results.push(...task.operations.filter((op) => op.saveOnApi));
            return results;
        }, []);
    }

    /*
        front
    */

    saveStorage(instance: WorkflowInstanceDto) {
    }

    /** public for test */
    _reconsituteData(instance: WorkflowInstanceDto) {
        // 01 - filter data, keep only the inputs data
        instance.data = instance.data.filter(
            (d) => instance.workflowModel.variables.find((v) => v.key === d.key)
        );

        const downloadData: Observable<any> = defer(() => this.workflowSoService.downloadData(instance.data,
            instance.smartobjects, instance.documents, instance.context.smartmodels, instance.context));

        // 02 - get so (related to the data) from api
        return downloadData.pipe(mergeMap((download: DownloadDataDto) => {
            const obsTasks: Observable<any>[] = [];

            _.forEach(instance.stackTasks, (task: WorkflowStackTaskDto) => {
                const obsOperations = new Observable<any>((observer) => {

                    // execute all tasks operations
                    const opService = new InterpretorOperations(
                        instance.data,
                        instance.smartobjects,
                        instance.documents,
                        instance.context?.custom?.indexes);

                    _.forEach(task.operations, (operation: WorkflowOperationDto) => {
                        opService.executeOperation(operation);
                    });

                    opService.free();

                    // complete data
                    downloadData.subscribe(() => {
                        observer.complete();
                    });
                });
                obsTasks.push(obsOperations);
            });

            // concat
            return concat(...obsTasks)
                .pipe(
                    catchError((err) => throwError(err)),
                    toArray(),
                );
        }));
    }
}
