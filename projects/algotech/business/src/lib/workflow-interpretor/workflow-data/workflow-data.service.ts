
import { Injectable } from '@angular/core';
import {
    WorkflowInstanceDto, WorkflowModelDto,
    WorkflowOperationDto, SmartObjectDto, DocumentDto, WorkflowTaskActionDto, ScheduleDto, WorkflowInstanceContextDto
} from '@algotech/core';
import { WorkflowDataApiService } from './workflow-data-api.service';
import { WorkflowDataStorageService } from './workflow-data-storage.service';
import { Observable, of, throwError, concat, defer, zip } from 'rxjs';
import { mergeMap, catchError, map, toArray, first, tap } from 'rxjs/operators';
import { SettingsDataService, DataService } from '@algotech/angular';
import { FilesService } from '../../workflow-interpretor/@utils/files.service';
import * as _ from 'lodash';
import { FileAssetDto } from '../../dto/file-asset.dto';
import { WorkflowSoService } from '../workflow-reader/workflow-so/workflow-so.service';
import { WorkflowUtilsService } from '../workflow-utils/workflow-utils.service';
import { WorkflowProfilesService } from '../workflow-reader/workflow-profiles/workflow-profiles.service';
import {
    WorkflowErrorModelNotFind,
    WorkflowErrorInstanceNotFind
} from '../../../../interpretor/src/error/interpretor-error';
import { InterpretorData } from '../../../../interpretor/src/interpretor-data/interpretor-data';
import { InterpretorMetricsKeys, SaveOperationMode } from '../../../../interpretor/src';
import { WorkflowMetricsService } from '../workflow-metrics/workflow-metrics.service';

const PREFIX_DOCUMENT = '$document';
const PREFIX_SMART_OBJECT = '$so';

@Injectable()
export class WorkflowDataService extends InterpretorData {

    constructor(
        protected settingsDataService: SettingsDataService,
        protected filesService: FilesService,
        protected dataService: DataService,
        protected workflowSoService: WorkflowSoService,
        protected workflowDataApiService: WorkflowDataApiService,
        protected workflowDataStorageService: WorkflowDataStorageService,
        protected workflowUtilsService: WorkflowUtilsService,
        protected workflowProfilesService: WorkflowProfilesService,
        protected workflowMetrics: WorkflowMetricsService) {

        super(workflowUtilsService, workflowDataApiService, workflowSoService);
    }

    public getModel(model: string, context: WorkflowInstanceContextDto): Observable<WorkflowModelDto> {
        const workflow = _.find(this.settingsDataService.workflows, (w) => w.key === model);
        if (!workflow) {
            return throwError(new WorkflowErrorModelNotFind('ERR-143', `${model} {{NOT-FOUND}}`));
        }
        return of(workflow);
    }

    public getInstance(uuid: string, context: WorkflowInstanceContextDto): Observable<WorkflowInstanceDto> {
        return this.workflowDataStorageService.getInstance(uuid).pipe(
            mergeMap((instanceStorage) => {
                if (instanceStorage) {
                    instanceStorage.context = context;
                    return of(instanceStorage);
                }

                return this.workflowDataApiService.getInstance(uuid)
                    .pipe(
                        catchError(() =>
                            throwError(new WorkflowErrorInstanceNotFind('ERR-142', `${uuid} {{NOT-FOUND}}`))
                        ),
                        mergeMap((instance: WorkflowInstanceDto) => {
                            instance.context = context;
                            return this.loadData(instance).pipe(
                                map(() => instance)
                            );
                        })
                    );
            })
        );
    }

    public save(instance: WorkflowInstanceDto): Observable<any> {

        this.workflowMetrics.start(instance.context.metrics, InterpretorMetricsKeys.InterpretorSave);
        // save the instance (instant T)
        const instanceCopy: WorkflowInstanceDto = _.cloneDeep(instance);

        // local workflow instance save
        return defer(() => {
            this.saveStorage(instance);
            this.finalize(instanceCopy);

            const save$ = this.dataService.networkService.offline ? of(instanceCopy) : this.saveApi(instanceCopy);
            return save$.pipe(
                tap(() => this.workflowMetrics.stop(instance.context.metrics, InterpretorMetricsKeys.InterpretorSave))
            );
        })
    }

    public saveInstance(instance: WorkflowInstanceDto, force = false): Observable<WorkflowInstanceDto> {
        const saveInstance = this.isCompleted(instance) || force ||
            _.find(this.getOperations(instance), (op: WorkflowOperationDto) => op.requireInstance);

        return saveInstance ? this.workflowDataApiService.save(instance).pipe(
            tap(() => {
                instance.saved = true;
                this.saveStorage(instance);
            })
        ) : of({});
    }

    public saveFinalOperations(instance: WorkflowInstanceDto) {
        const operations = this.getOperations(instance);
        // save wholeness operations
        if (this.dataService.mobile) {
            return this.workflowDataApiService.zipOperations(operations).pipe(
                mergeMap(() => this.workflowDataStorageService.removeInstance(instance.uuid))
            );
        } else {
            // save wholeness operations
            return concat(...
                (
                    _.map(
                        operations, (operation) => {
                            return this.workflowDataApiService.saveOperation(instance, operation, SaveOperationMode.End).pipe(
                                first() // force complete for concat
                            );
                        })
                )
            ).pipe(
                catchError((err) => throwError(err)),
                toArray(),
            );
        }
    }

    /*
        front
    */

    public saveStorage(instance: WorkflowInstanceDto) {
        this.workflowDataStorageService.save(instance).subscribe();
    }

    public finalize(instance: WorkflowInstanceDto) {
        if (instance.state === 'finished') {
            if (this.dataService.mobile) {
                // save document && so
                zip(
                    this.dataService.saveAll(of(instance.documents), PREFIX_DOCUMENT, 'uuid'),
                    this.dataService.saveAll(of(instance.smartobjects), PREFIX_SMART_OBJECT, 'uuid'),
                ).subscribe();
            }
            // set all assets currently private (attached to the current workflow) to public
            this.filesService.getAll('private').subscribe((assets: FileAssetDto[]) => {
                _.each(assets, (asset: FileAssetDto) => {
                    if (asset.private === instance.uuid) {
                        asset.private = false;
                        this.filesService.setAsset(asset).subscribe();
                    }
                });
            });
        }
    }

    /*
        utils
    */

    public isCompleted(instance: WorkflowInstanceDto) {
        const profils = this.workflowUtilsService.getProfilCurrentTask(instance);
        return instance.state === 'finished' || instance.state === 'canceled' ||
            !this.workflowProfilesService.checkProfil(instance, profils);
    }

    public getLocalInstance(uuid: string): Observable<WorkflowInstanceDto> {
        return this.workflowDataStorageService.getInstance(uuid);
    }
}
