import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { zip, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaskObjectCreateUIError} from '../../../../container-error/container-error';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { TaskObjectCreateUIDto } from '../../../../dto/task-object-create-ui.dto';
import { SmartModelDto, SmartObjectDto } from '@algotech-ce/core';
import { SettingsDataService } from '@algotech-ce/angular';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import * as _ from 'lodash';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    template: `
    <div class="container">
        <div class="at-list-content">
            <div class="at-list">
                <div class="at-list-item" *ngFor="let model of models" (click)="select(model)">
                    <div class="model">
                        <div class="code">
                            {{model.displayName | tlang | uppercase | truncate:2:false:''}}
                        </div>
                        {{model.displayName | tlang}}
                    </div>
                </div>
            </div>
        </div>
    </div>
  `,
    styleUrls: ['./task-object.create.component.scss']
})
export class TaskObjectCreateUIComponent implements TaskComponent {

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskObjectCreateUIDto;
        zip(
            customData.skills ? customData.skills() : of('')
        ).pipe(            
            map((values: any[]) => {
                this.skills = values[0];
                return this.loadModels();
            }),
        ).subscribe(
            (models: SmartModelDto[]) => {
                this.models = models;
            },
            (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-078', err, TaskObjectCreateUIError));
            });
    }

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    skills = '';
    models: SmartModelDto[] = [];

    constructor(
        private settingsDataService: SettingsDataService,
        private soUtils: SoUtilsService,
        private taskUtils: TaskUtilsService) { }

    private loadModels() {
        return _.filter(this.settingsDataService.smartmodels, (smartModel: SmartModelDto) => {
            if (this.skills === '') {
                return true;
            }
            return smartModel.skills[this.skills] === true;
        });
    }

    public select(smartModel: SmartModelDto) {
        const soInstance: SmartObjectDto = this.soUtils.createInstance(smartModel);

        if (!soInstance) {
            this.handleError.emit(new TaskObjectCreateUIError('ERR-079', '{{SMARTMODEL-CANT-BE-CREATED}}'));
        }
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [
                {
                    saveOnApi: true,
                    data: this._getTransitionData(this._task),
                    type: 'smartobjects',
                    value: soInstance
                }
            ]
        };

        this.validate.emit(validation);
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskObjectCreateUIError('ERR-080', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
