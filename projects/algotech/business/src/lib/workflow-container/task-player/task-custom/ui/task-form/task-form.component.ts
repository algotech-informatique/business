import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { TaskFormDto } from '../../../../dto/task-form.dto';
import { zip, of } from 'rxjs';
import { SmartObjectDto, WorkflowOperationDto, CrudDto, TagListDto, SmartPropertyModelDto } from '@algotech-ce/core';
import { TaskFormError } from '../../../../container-error/container-error';
import * as _ from 'lodash';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { WorkflowUtilsService } from '../../../../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { InterpretorTaskActionAssetDto } from '../../../../../../../interpretor/src/dto';
import { PropertiesOptionsDto } from '../../../../../dto/properties-options.dto';
import { SettingsDataService } from '@algotech-ce/angular';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    styleUrls: ['./task-form.component.scss'],
    template: `
    <div class="content wf-padding" *ngIf="loaded">
        <at-so-form
            [object]="object"
            [objects]="objects"
            [addedObjects]="addedObjects"
            [options]="options"
            [readOnly]="readOnly"
            [description]="description"
            [instance]="_task.instance"
            [contextUuid]="_task.instance.uuid"
            [taggable]="taggable"
            [tagsLists]="tagsLists"
            [tags]="tags"
            (changeValue)="onChangeValue($event)">

            <at-task-transitions
                *ngIf="this._task.transitions.length > 1"
                [transitions]="_task.transitions"
                (validate)="_validate($event)">
            </at-task-transitions>

        </at-so-form>
    </div>`
})
export class TaskFormComponent implements TaskComponent {
    _task: InterpretorTaskDto;
    @Input('task')

    set task(t: InterpretorTaskDto) {
        this.loaded = false;
        this._task = t;
        const customData = this._task.custom as TaskFormDto;
        zip(
            customData.object(),
            customData.options ? customData.options({ notInspectObject: true }) : of(null),
            customData.readOnly ? customData.readOnly() : of(false),
            customData.activeTag ? customData.activeTag() : of(false),
            customData.modelsTag ? customData.modelsTag() : of([]),
            customData.description ? customData.description() : of(null),
        ).subscribe((res: any[]) => {
            this.object = res[0];
            this.options = res[1];
            this.readOnly = res[2];
            this.description = res[5];
            this.objects = _.cloneDeep(this._task.instance.smartobjects);
            this.addedObjects = this.getAddedObjects();
            const allListsTags: TagListDto[] = this.settingsDataService.tags;
            this.tagsLists = _.filter(allListsTags, (listTag: TagListDto) => _.includes(res[4], listTag.key));
            this.taggable = res[3];
            this.tags = this.taggable && this.object.skills.atTag && this.object.skills.atTag.tags ?
                this.object.skills.atTag.tags :
                [];

            if (this._allPropertiesHidden() && !this.workflowUtilsService.getActiveTask(t.instance).finishDate) {
                this._validateDirectly();
            }

            this.loaded = true;
        }, (err) => {
            this.handleError.emit(this.taskUtils.handleError('ERR-075', err, TaskFormError));
        });
    }
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    options: PropertiesOptionsDto[] = [];

    readOnly = false;
    object: SmartObjectDto = null;
    objects: SmartObjectDto[] = [];
    actions: InterpretorTaskActionAssetDto[] = [];
    addedObjects: SmartObjectDto[] = [];
    output: SmartObjectDto[] = [];
    loaded = false;
    taggable: boolean;
    description: string;
    tags: string[];
    tagsLists: TagListDto[];

    constructor(
        private workflowUtilsService: WorkflowUtilsService,
        private settingsDataService: SettingsDataService,
        private soUtils: SoUtilsService,
        private taskUtils: TaskUtilsService
    ) { }

    getAddedObjects() {
        const crud: WorkflowOperationDto[] = _.map(
            this.workflowUtilsService.getActiveTask(this._task.instance).operations.filter((op) => op.type === 'crud'),
            ((operation) => operation.value)
        );

        return _.reduce(crud, (results, operation: CrudDto) => {
            if (operation && operation.value && operation.op === 'add' && operation.collection === 'smartobjects') {
                const object = _.find(this.objects, (so) => so.uuid === operation.value.uuid);
                if (object) {
                    results.push(object);
                }
            }
            return results;
        }, []);
    }

    onChangeValue(data: { smartObjects: SmartObjectDto[], actions: InterpretorTaskActionAssetDto[], valid: boolean }) {
        this.output = data.smartObjects;
        this.actions = data.actions;
        this._partialValidate(data.valid);
    }

    _validateDirectly() {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [],
        };
        this.validate.emit(validation);
    }

    _validate(transitionKey: string) {
        const validation: InterpretorValidateDto = this._computeValidation(transitionKey);
        this.validate.emit(validation);
    }

    _partialValidate(authorizationToNext: boolean) {
        if (this._task.transitions.length >= 1) {
            const validation: InterpretorValidateDto = this._computeValidation(this._task.transitions[0].key);
            this.partialValidate.emit({ validation, authorizationToNext });
        }
    }

    _computeValidation(transitionKey: string): InterpretorValidateDto {
        const transfers = _.map(this.output, (so) => {
            const transfer: InterpretorTransferTransitionDto = {
                saveOnApi: true,
                type: 'smartobjects',
                value: so
            };
            return transfer;
        });

        transfers.push(..._.map(this.actions, (action: InterpretorTaskActionAssetDto[]) => {
            const transfer: InterpretorTransferTransitionDto = {
                saveOnApi: true,
                type: 'action',
                value: action
            };
            return transfer;
        }));

        const validation: InterpretorValidateDto = {
            transitionKey,
            transfers
        };

        return validation;
    }

    _isVisible(property: SmartPropertyModelDto) {
        const options: PropertiesOptionsDto = _.find(this.options, (o) => o.model === this.object.modelKey);
        if (!options) {
            return true;
        }
        const option = _.find(options.properties, (p) => p.key === property.key);
        if (!option) {
            return true;
        }
        const conditionMode = option.conditionMode;
        const conditionOperator = option.conditionOperator;
        const conditions = option.conditions;

        if (conditions && conditionMode === 'visible') {
            const objects = [
                this.object,
                ...this.soUtils.findSubObjects(this.object, this.objects, this.settingsDataService.smartmodels),
            ];
            return this.soUtils.respectConditions(conditions, objects, true, conditionOperator);
        }

        return true;
    }

    _allPropertiesHidden() {
        if (this.object) {
            const model = this.soUtils.getModel(this.object.modelKey, this.settingsDataService.smartmodels);

            if (this.options.length === 0) {
                return false;
            }
            return model.properties.every((prop) => {
                return !this.soUtils.propertyIsShowed(prop, model, this.options) || !this._isVisible(prop);
            });
        }

        return false;
    }
}
