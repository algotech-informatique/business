import {
    WorkflowInstanceDto,
    WorkflowOperationDto,
    CrudDto,
    PatchPropertyDto,
    WorkflowTaskActionDto,
    SmartObjectDto,
    WorkflowInstanceContextDto,
} from '@algotech-ce/core';
import { Observable, of, empty } from 'rxjs';
import * as _ from 'lodash';
import { SaveOperationMode } from '../dto';
import { InterpretorUtils } from '../interpretor-utils/interpretor-utils';


export abstract class InterpretorDataApi {

    constructor(protected workflowUtilsService: InterpretorUtils) { }

    abstract postInstance(instanceCopy: WorkflowInstanceDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract putInstance(instanceCopy: WorkflowInstanceDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract deleteInstance(instanceCopy: WorkflowInstanceDto, context: WorkflowInstanceContextDto): Observable<any>;

    abstract postSo(so: SmartObjectDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract patchSo(uuid: string, patches: PatchPropertyDto[], context: WorkflowInstanceContextDto): Observable<any>;

    abstract _actionSign(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionSmartflow(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionUpload(action: WorkflowTaskActionDto, options: { cache?: boolean },
        context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionLinkCache(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionLockDocument(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionEditDocument(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionDeleteDocuments(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionDeleteObject(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionDeleteSchedule(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionNotify(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionSendMail(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionGenerateReport(smartObjects:  SmartObjectDto[],
        action: WorkflowTaskActionDto, options: { cache?: boolean }, context: WorkflowInstanceContextDto): Observable<any>;
    abstract _actionCreateSchedule(action: WorkflowTaskActionDto, context: WorkflowInstanceContextDto): Observable<any>;

    public save(instance: WorkflowInstanceDto): Observable<any> {
        const instanceCopy: WorkflowInstanceDto = _.cloneDeep(instance);

        for (const task of instanceCopy.stackTasks) {
            task.saved = true;
        }

        this.removeProperties(instanceCopy);

        if (!instance.saved) {
            instanceCopy.saved = true;
            if (this.workflowUtilsService.isFinished(instance)) {
                return of(instance);
            }

            return this.postInstance(instanceCopy, instance.context);
        } else {
            if (this.workflowUtilsService.isFinished(instance)) {
                return this.deleteInstance(instance, instance.context);
            }
            
            this.removeUpdateProperties(instanceCopy);
            return this.putInstance(instanceCopy, instance.context);
        }
    }

    private removeProperties(instance: WorkflowInstanceDto) {
        // remove local properties
        delete instance.smartobjects;
        delete instance.documents;
        delete instance.context;
    }

    private removeUpdateProperties(instance: WorkflowInstanceDto) {
        // remove local properties
        delete instance.settings;
        delete instance.workflowModel;
    }

    public saveOperation(instance: WorkflowInstanceDto, operation: WorkflowOperationDto, mode: SaveOperationMode): Observable<any> {
        switch (operation.type) {
            case 'crud':
                if (mode === SaveOperationMode.EndForceImmediately) {
                    return of(empty());
                }

                return this._saveOperationCrud(operation.value as CrudDto, instance.context);
            case 'action':
                return this._saveOperationAction(operation.value as WorkflowTaskActionDto, mode, instance.context, instance.smartobjects);
        }
    }

    /** public for test */
    _saveOperationCrud(crud: CrudDto, context: WorkflowInstanceContextDto) {
        switch (crud.op) {
            case 'add':
                switch (crud.collection) {
                    case 'smartobjects':
                        return this.postSo(crud.value, context);
                }
                break;
            case 'patch': {
                const patchOp: PatchPropertyDto[] = crud.value as PatchPropertyDto[];
                switch (crud.collection) {
                    case 'smartobjects':
                        return this.patchSo(crud.key, patchOp, context);
                }
                break;
            }
        }
        return of({});
    }

    /** public for test */
    _saveOperationAction(action: WorkflowTaskActionDto, mode: SaveOperationMode,
        context: WorkflowInstanceContextDto, smartobjects: SmartObjectDto[]) {
        let operations: Observable<any>[] = [];
        switch (mode) {
            case SaveOperationMode.Asap:
                operations = [
                    this._actionUpload(action, {}, context),
                    this._actionGenerateReport(smartobjects, action, {}, context),
                    this._actionEditDocument(action, context),
                    this._actionLockDocument(action, context),
                    this._actionDeleteDocuments(action, context),
                    this._actionDeleteObject(action, context),
                    this._actionCreateSchedule(action, context),
                    this._actionSign(action, context),
                    this._actionNotify(action, context),
                    this._actionSendMail(action, context),
                    this._actionDeleteSchedule(action, context),
                    this._actionSmartflow(action, context),
                ];
                break;
            case SaveOperationMode.End:
                operations = [
                    this._actionLinkCache(action, context),
                    this._actionSign(action, context),
                    this._actionEditDocument(action, context),
                    this._actionDeleteDocuments(action, context),
                    this._actionDeleteObject(action, context),
                    this._actionCreateSchedule(action, context),
                    this._actionDeleteSchedule(action, context),
                    this._actionSmartflow(action, context),
                ];
                break;
            case SaveOperationMode.EndForceImmediately:
                operations = [
                    this._actionUpload(action, { cache: true }, context),
                    this._actionGenerateReport(smartobjects, action, { cache: true }, context),
                    this._actionNotify(action, context),
                    this._actionSendMail(action, context),
                    this._actionLockDocument(action, context),
                ];
                break;
        }
        operations = _.compact(operations);
        if (operations.length === 1) {
            return operations[0];
        }
        return of(empty());
    }
}
