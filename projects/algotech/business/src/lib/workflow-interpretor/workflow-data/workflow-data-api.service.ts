import { Injectable } from '@angular/core';
import {
    WorkflowInstanceDto,
    WorkflowOperationDto,
    PatchPropertyDto,
    WorkflowTaskActionDto,
    ReportGenerateDto,
    ReportPreviewDto,
    SmartObjectDto,
    WorkflowInstanceContextDto,
    WorkflowLaunchOptionsDto,
} from '@algotech/core';
import {
    WorkflowInstancesService, SmartObjectsService,
    EmailService,
    NotificationsService,
    ScheduleService,
} from '@algotech/angular';
import { Observable, of, throwError } from 'rxjs';
import * as _ from 'lodash';
import { FilesService } from '../../workflow-interpretor/@utils/files.service';
import { ReportsUtilsService } from '.././@utils/reports-utils.service';
import { WorkflowUtilsService } from '../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { mergeMap, tap } from 'rxjs/operators';
import { FileAssetDto } from '../../dto/file-asset.dto';
import { WorkflowErrorAssetNotFind } from '../../../../interpretor/src/error/interpretor-error';
import {
    WorkflowTaskActionSignDto, WorkflowTaskActionUploadDto, WorkflowTaskActionDeleteDocumentsDto,
    WorkflowTaskActionEditDocumentDto,
} from '../../../../interpretor/src/dto';
import { InterpretorDataApi } from '../../../../interpretor/src/interpretor-data/interpretor-data-api';
import { SmartFlowUtilsService } from '../@utils/smartflow-utils.service';

@Injectable()
export class WorkflowDataApiService extends InterpretorDataApi {

    constructor(
        private workflowInstancesService: WorkflowInstancesService,
        private notificationService: NotificationsService,
        private smartObjectsServices: SmartObjectsService,
        private smartFlowUtils: SmartFlowUtilsService,
        private emailService: EmailService,
        private filesService: FilesService,
        private reportsUtilsService: ReportsUtilsService,
        protected workflowUtilsService: WorkflowUtilsService,
        private scheduleService: ScheduleService
    ) {
        super(workflowUtilsService);
    }

    public getInstance(uuid: string): Observable<WorkflowInstanceDto> {
        return this.workflowInstancesService.get(uuid);
    }

    public zipOperations(operations: WorkflowOperationDto[]) {
        return this.workflowInstancesService.zipOperations(operations);
    }

    /*
    abstract
    */

    public postInstance(instance: WorkflowInstanceDto): Observable<any> {
        return this.workflowInstancesService.post(instance);
    }

    public putInstance(instance: WorkflowInstanceDto): Observable<any> {
        return this.workflowInstancesService.put(instance);
    }

    public deleteInstance(instance: WorkflowInstanceDto): Observable<any> {
        return this.workflowInstancesService.delete(instance.uuid);
    }

    public postSo(so: SmartObjectDto): Observable<any> {
        return this.smartObjectsServices.post(so);
    }

    public patchSo(uuid: string, patches: PatchPropertyDto[]): Observable<any> {
        return this.smartObjectsServices.patchProperty(uuid, patches);
    }

    /** public for test */
    _actionSign(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'sign') {
            const _action: WorkflowTaskActionSignDto = action.value;
            return this.smartObjectsServices.signature(
                _action.signature,
                _action.signatureName,
                _action.signatureType,
                _action.smartObject,
                _action.info);
        }
        return null;
    }

    /** public for test */
    _actionSmartflow(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'smartflow') {
            const _action: WorkflowLaunchOptionsDto = action.value;
            return this.smartFlowUtils.start(_action, null);
        }
        return null;
    }

    /** public for test */
    _actionUpload(action: WorkflowTaskActionDto, options: { cache?: boolean }) {
        if (action.actionKey === 'upload') {
            const _action: WorkflowTaskActionUploadDto = action.value;
            return this.filesService.getAsset(_action.file).pipe(
                mergeMap((asset: FileAssetDto) => {
                    if (!asset) {
                        return throwError(new WorkflowErrorAssetNotFind('ERR-144', `{{NOT-FOUND}} ${_action.fileName}`));
                    }

                    if (asset.saved) {
                        return of({});
                    }

                    const blob = this.filesService._toFile(asset.file, _action.fileName, _action.fileType);
                    const soUuid = options.cache || !_action.smartObject ? 'cache' : _action.smartObject;
                    return this.smartObjectsServices.uploadFile(blob, _action.fileName, _action.fileType, soUuid, _action.info).pipe(
                        tap(() => {
                            asset.saved = true;
                            if (!options.cache) {
                                asset.private = false;
                            }
                            this.filesService.setAsset(asset);
                        })
                    );
                }));
        }
        return null;
    }

    /** public for test */
    _actionLinkCache(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'upload' || action.actionKey === 'linkCachedSysFile') {
            const _action: WorkflowTaskActionUploadDto = action.value;

            if (!_action.smartObject) {
                return null;
            }

            return this.smartObjectsServices.linkFile(_action.smartObject, _action.info).pipe(
                tap(() => {
                    this.filesService.getAsset(_action.file).subscribe(
                        (asset: FileAssetDto) => {
                            if (asset) {
                                asset.private = false;
                                this.filesService.setAsset(asset);
                            }
                        }
                    );
                })
            );
        }

        if (action.actionKey === 'reportGenerate') {
            const dto: ReportGenerateDto = action.value;
            return this.smartObjectsServices.linkFile(dto.soUuid, dto.details);
        }
        return null;

    }

    /** public for test */
    _actionLockDocument(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'lock-document') {
            const _action: WorkflowTaskActionEditDocumentDto = action.value;
            return this.smartObjectsServices.editDocument(_action.smartObject, _action.edit);
        }
        return null;
    }

    /** public for test */
    _actionEditDocument(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'edit-document') {
            const _action: WorkflowTaskActionEditDocumentDto = action.value;
            return this.smartObjectsServices.editDocument(_action.smartObject, _action.edit);
        }
        return null;
    }

    /** public for test */
    _actionDeleteDocuments(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'delete-documents') {
            const _action: WorkflowTaskActionDeleteDocumentsDto = action.value;
            return this.smartObjectsServices.removeDocument(
                { uuid: _action.smartObject, documentID: _action.documentsID }
            );
        }
        return null;
    }

    /** public for test */
    _actionDeleteObject(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'delete') {
            return this.smartObjectsServices.delete(action.value);
        }
        return null;
    }

    /** public for test */
    _actionDeleteSchedule(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'delete-schedule') {
            return this.scheduleService.delete(action.value);
        }
        return null;
    }

    /** public for test */
    _actionNotify(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'notify') {
            return this.notificationService.post(action.value);
        }
        return null;
    }

    /** public for test */
    _actionSendMail(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'mail') {
            return this.emailService.sendMail(action.value);
        }
        return null;
    }

    /** public for test */
    _actionGenerateReport(smartObjects: SmartObjectDto[], action: WorkflowTaskActionDto,
        options: { cache?: boolean }, context: WorkflowInstanceContextDto) {
        if (action.actionKey === 'reportGenerate') {

            const _reportGenerate: ReportGenerateDto = _.cloneDeep(action.value);
            if (options.cache) {
                _reportGenerate.soUuid = 'cache';
            }

            return this.reportsUtilsService.generateReport(_reportGenerate, smartObjects, context);
        }
        if (action.actionKey === 'reportPreview') {

            const _reportPreview: ReportPreviewDto = _.cloneDeep(action.value);
            return this.reportsUtilsService.previewReport(_reportPreview, smartObjects, context);
        }

        return null;
    }

    /** public for test */
    _actionCreateSchedule(action: WorkflowTaskActionDto) {
        if (action.actionKey === 'create-schedule') {
            return this.scheduleService.post(action.value);
        }
        return null;
    }
}
