import { Component, Output, EventEmitter, Input } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { TaskScheduleCreateError } from '../../../../container-error/container-error';
import { TaskScheduleCreateDto } from '../../../../dto/task-schedule-create.dto';
import { zip, of } from 'rxjs';
import * as _ from 'lodash';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import {
    SmartObjectDto, UserDto, WorkflowModelDto, ScheduleDto, ScheduleWorkflowDto, ScheduleReceiverDto,
    AgendaTypeDto,
    PairDto
} from '@algotech/core';
import {
    AuthService, SettingsDataService,
    GenericListsDisplayService
} from '@algotech/angular';
import { TranslateService } from '@ngx-translate/core';
import { SysUtilsService } from '../../../../../workflow-interpretor/@utils/sys-utils.service';
import { ScheduleUtilsService } from '../../../../../workflow-interpretor/@utils/schedule-utils.service';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

interface ScheduleOption {
    value: string;
    text: string;
    schedule: AgendaTypeDto;
}

interface StatusOption {
    value: string;
    text: string;
}

@Component({
    templateUrl: './task-schedule-create.component.html',
    styleUrls: ['./task-schedule-create.component.scss']
})
export class TaskScheduleCreateComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    style = 'underline';

    validateFields: boolean;

    smartObjects: SmartObjectDto[] = [];
    users: string[] | UserDto[] = [];
    workflows: WorkflowModelDto[] = [];
    profiles: string[] = [];
    receivers: UserDto[] = [];
    typeKeyExists = false;
    typeKey: string;
    tags: string[];

    titleWorkflow = '';
    startDate: Date;
    endDate: Date;
    repetitionMode: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' = 'none';
    scheduleStatus = '';
    scheduleStatusGroup = '';
    listAgenda: ScheduleOption[] = [];
    schedule: ScheduleDto;
    listscheduleStatus: PairDto[] = [];

    activeWorkFlowUuid = '';
    visibleOptionAgenda = false;

    repetition: PairDto[] = [
        { key: 'none', value: this.translate.instant('TASK-MODEL-GUI.TASK.CREATE-SCHEDULE.NONE') },
        { key: 'daily', value: this.translate.instant('TASK-MODEL-GUI.TASK.CREATE-SCHEDULE.DAILY') },
        { key: 'weekly', value: this.translate.instant('TASK-MODEL-GUI.TASK.CREATE-SCHEDULE.WEEKLY') },
        { key: 'monthly', value: this.translate.instant('TASK-MODEL-GUI.TASK.CREATE-SCHEDULE.MONTHLY') },
        { key: 'yearly', value: this.translate.instant('TASK-MODEL-GUI.TASK.CREATE-SCHEDULE.YEARLY') }
    ];

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskScheduleCreateDto;
        zip(
            customData.linkedSO ? customData.linkedSO() : of([]),
            customData.tags ? customData.tags() : of([]),
            customData.scheduleTypeKey ? customData.scheduleTypeKey() : of(''),
            customData.receivers ? customData.receivers() : of([]),
            customData.linkedWorkflow ? customData.linkedWorkflow() : of([]),
            customData.assignedUsers ? customData.assignedUsers() : of([]),
            customData.beginDate ? customData.beginDate({ formatted: true }) : of(''),
            customData.endDate ? customData.endDate({ formatted: true }) : of(''),
            customData.repetitionMode ? customData.repetitionMode() : of(''),
            customData.scheduleStatus ? customData.scheduleStatus() : of(''),
            customData.scheduleTitle ? customData.scheduleTitle() : of(''),
            customData.profiles ? customData.profiles() : of([]),
        ).subscribe((values: any[]) => {
                this.smartObjects = _.isArray(values[0]) ? values[0] : [values[0]];
                this.tags = values[1];
                this.typeKey = values[2];
                this.receivers = _.isArray(values[3]) ? values[3] : [values[3]];
                this.workflows = _.isArray(values[4]) ? values[4] : [values[4]];
                this.users = _.isArray(values[5]) ? values[5] : [values[5]];

                this.startDate = (values[6]) ? new Date(values[6]) : null;
                this.endDate = (values[7]) ? new Date(values[7]) : null;
                this.repetitionMode = (values[8] !== '') ? values[8] : 'none';
                this.scheduleStatus = values[9];
                this.titleWorkflow = values[10];
                this.profiles = values[11];

                this.activeWorkFlowUuid = this._task.instance.workflowModel.uuid;

                this._loadListSettingsAgenda();
                this._loadData();
                this._loadGenericList('asc');
                this.changeData();
            }, (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-089', err, TaskScheduleCreateError));
            });
    }

    constructor(
        private authService: AuthService,
        private settingsDataService: SettingsDataService,
        private genericListDisplay: GenericListsDisplayService,
        private translate: TranslateService,
        private sysUtils: SysUtilsService,
        private scheduleUtilsService: ScheduleUtilsService,
        private taskUtils: TaskUtilsService
    ) {
    }

    _loadData() {
        if (this.typeKey) {
            this.typeKeyExists = true;
            this.visibleOptionAgenda = false;
        } else {
            this.typeKey = this._recuperationSchedule();
            this.typeKeyExists = (this.typeKey !== '');
        }
    }

    _loadGenericList(sort: 'default' | 'asc' | 'desc') {
        const genericListStatus = this.genericListDisplay.getSorted(this.scheduleStatusGroup, sort);
        this.listscheduleStatus = _.map(genericListStatus ? genericListStatus.values : [], (listValue) => {
            const data: PairDto = {
                key: listValue.key,
                value: listValue.value
            };
            return data;
        });
    }

    _loadListSettingsAgenda() {

        this.listAgenda = this.scheduleUtilsService.loadListSettingsAgenda(this.settingsDataService.settings.agenda,
            this.activeWorkFlowUuid, this._task.instance.context.user);
        this.scheduleStatusGroup = this.scheduleUtilsService.loadListSettingsStatusGroup(this.settingsDataService.settings.agenda,
            this._task.instance.context.user);
        this.visibleOptionAgenda = (this.listAgenda.length > 1);
    }

    _loadSchedule(selectedKey) {
        const selectSchedule: ScheduleOption = _.find(this.listAgenda, { value: selectedKey });
        this._constructionSchedule(selectSchedule.schedule);
    }

    _recuperationSchedule(): string {
        if (this.listAgenda.length === 1) {
            return this.listAgenda[0].value;
        } else {
            return '';
        }
    }

    _constructionSchedule(selectSchedule: AgendaTypeDto) {
        if (selectSchedule) {
            const enterTags: string[] = this.scheduleUtilsService.recuperationTags(this.tags, selectSchedule);
            const enterReceivers: ScheduleReceiverDto[] =
                this.scheduleUtilsService.recuperationReceivers(this.receivers, selectSchedule, this._task.instance.context.groups);
            const enterWorkFlows: ScheduleWorkflowDto[] = this.scheduleUtilsService.recuperationWorkflows(this.workflows, selectSchedule);

            this.schedule = this.scheduleUtilsService.constructionSchedule(selectSchedule, this.smartObjects, enterTags, this.users,
                this.titleWorkflow, this.startDate, this.endDate, enterReceivers, enterWorkFlows, this.repetitionMode,
                this.scheduleStatus, this._task.instance.context.user);
        }
    }

    changeData() {
        this.validateFields = ((this.startDate) && (this.endDate) && (this.typeKey !== '') && (this.scheduleStatus !== ''));
        if (this.validateFields) {
            this._loadSchedule(this.typeKey);
            this._createSchedule();
        }
    }

    _createSchedule() {
        const transfers: InterpretorTransferTransitionDto[] = [];
        const myData = this.scheduleUtilsService.getTransitionData(this._task);
        if (myData) {
            transfers.push({
                saveOnApi: false,
                data: myData,
                type: 'sysobjects',
                value: this.sysUtils.transform(this.schedule, 'sys:schedule', this.authService.localProfil.preferedLang)
            });
        }

        transfers.push({
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'create-schedule',
                value: this.schedule
            }
        });

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers
        };

        this.partialValidate.emit({ validation, authorizationToNext: true });
    }
}
