import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { CustomResolverParams, InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { SmartObjectDto, ScheduleDto } from '@algotech-ce/core';
import { zip, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TaskListDto } from '../../../../dto/task-list.dto';
import { TaskListError } from '../../../../container-error/container-error';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import * as _ from 'lodash';
import { SysUtilsService } from '../../../../../workflow-interpretor/@utils/sys-utils.service';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    template: `
        <at-so-list
            [columnsDisplay]="columnsDisplay"
            [searchVisible]="searchVisible"
            [multipleSelection]="multipleSelection"
            [type]="type"
            [mode]="mode"
            [excludeObjects]="compareObjects"
            [getItems]="getItems"
            [items]="items"
            [pagination]="pagination"
            [filterProperty]="filterProperty"
            [isFilterProperty]="filterActive"
            [searchValue]="searchValue"
            (changeValue)="buildValidate($event)"
            (handleError)="onError($event)"
            (showToast)="onToast($event)"
        >
        </at-so-list>
    `,
})
export class TaskListComponent implements TaskComponent, OnInit {

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskListDto;
        this.dataList = customData;
        zip(
            customData.columnsDisplay(),
            customData.multipleSelection ? customData.multipleSelection() : of(false),
            customData.search ? customData.search() : of(false),
            customData.cart ? customData.cart() : of(true),
            customData.excludeObjects ? customData.excludeObjects() : of([]),
            customData.filterProperty ? customData.filterProperty() : of(null),
            customData.filterActive ? customData.filterActive() : of(true),
            customData.loop ? customData.loop() : of(false),
            customData.pagination ? customData.pagination() : of(false),
            customData.searchValue ? customData.searchValue() : of(''),
        ).pipe(
            tap((values: any[]) => {
                this.columnsDisplay = values[0];
                this.multipleSelection = values[1];
                this.searchVisible = values[2];
                this.mode = values[3] ? 'cart' : 'check';
                const compare: any[] = _.isArray(values[4]) ? values[4] : [values[4]];
                this.compareObjects = this.getListCompare(_.compact(compare));
                this.type = this._getTransitionData(this._task).type;
                this.getItems = this.dataList.items;
                this.items = this.getAddedObjects();
                this.filterProperty = values[5];
                this.filterActive = values[6];
                this.loop = values[7];
                this.pagination = values[8];
                this.searchValue = this.searchVisible ? values[9] : '';
            }),
            catchError((err) => {
                throw new Error(`{{FAILED-TO-LOAD-LIST}} : ${err.message}`);
            }),
        ).subscribe({
            error: (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-068', err, TaskListError));
            }
        });
    }

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    dataList: TaskListDto;
    items: any[];
    getItems: (params?: CustomResolverParams) => Observable<any>;
    type = 'so:';
    multipleSelection = false;
    columnsDisplay = [];
    searchVisible = false;
    mode: 'check' | 'cart' = 'cart';
    compareObjects: string[] = [];
    filterProperty: string;
    filterActive: boolean;
    loop = false;
    pagination = false;
    searchValue: string;

    constructor(
        public soUtils: SoUtilsService,
        public sysUtils: SysUtilsService,
        private taskUtils: TaskUtilsService
    ) {
    }

    ngOnInit(): void {
        if (this.multipleSelection) {
            this.buildValidate({value: [], valid: true});
        }
        if (this.loop) {
            const validation: InterpretorValidateDto = {
                transfers: [],
                transitionKey: 'done'
            };
            this.partialValidate.emit({ validation, authorizationToNext: true });
        }
    }

    public buildValidate(event: { value: any | any[], valid: boolean }) {
        const wfTransfert: InterpretorTransferTransitionDto = {
            data: this._getTransitionData(this._task),
            saveOnApi: false,
            type: this._typeElement(),
            value: event.value,
        };
        const validation: InterpretorValidateDto = {
            transfers: [wfTransfert],
            transitionKey: 'select'
        };
        if (this.multipleSelection) {
            this.partialValidate.emit({ validation, authorizationToNext: event.valid });
        } else {
            this.validate.emit(validation);
        }
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskListError('ERR-069', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    private getAddedObjects() {
        const objects = _.cloneDeep(this._task.instance.smartobjects);
        const data = _.find(this._task.instance.data, (d) => d.key === this._getTransitionData(this._task).key);
        if (!data || !data.value || !_.isArray(data.value)) {
            return [];
        }

        return _.map(data.value, (value) => {
            if (_.isString(value)) {
                // uuid object
                return _.find(objects, (so) => so.uuid === value);
            } else {
                return value;
            }
        });
    }

    private _typeElement() {
        const sType = this._getTransitionData(this._task).type;
        if (sType.startsWith('sys:')) {
            return 'sysobjects';
        } else if (sType.startsWith('so:')) {
            return 'smartobjects';
        } else {
            this.handleError.emit(new TaskListError('ERR-070', `${sType} {{UNSUPPORTED-TYPE}}`));
        }
    }

    private getListCompare(compare: any[]): string[] {
        const sType = this._getTransitionData(this._task).type;
        if (!sType.startsWith('so:')) {
            return [];
        }
        if (compare.length === 0) {
            return [];
        }

        if (compare[0] instanceof SmartObjectDto) {
            const objects: SmartObjectDto[] = compare as SmartObjectDto[];
            return _.map(objects, (so: SmartObjectDto) => {
                return so.uuid;
            });
        } else {
            const objects: ScheduleDto[] = compare as ScheduleDto[];
            return _.map(objects, (result, schedule: ScheduleDto) => {
                result.push(...schedule.soUuid);
                return result;
            }, []);
        }
    }

    onError(message) {
        this.handleError.emit(new TaskListError('ERR-071', message));
    }

    onToast(message) {
        this.showToast.emit({ message, blur: false, time: 2000 });
    }
}
