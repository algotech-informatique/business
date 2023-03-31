import { zip, of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import {
    SmartObjectDto, UserDto, WorkflowModelDto, ScheduleDto, ScheduleWorkflowDto, ScheduleReceiverDto, AgendaTypeDto,
} from '@algotech-ce/core';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto, TaskScheduleCreateDto } from '../dto';
import { TaskScheduleCreateError } from '../error/tasks-error';

interface ScheduleOption {
    value: string;
    text: string;
    schedule: AgendaTypeDto;
}

export class TaskProcessScheduleCreate extends TaskBase {

    _task: InterpretorTaskDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        this._task = task;

        const customData = (task.custom as TaskScheduleCreateDto);
        return zip(
            customData.linkedSO ? customData.linkedSO() : of([]),
            customData.tags ? customData.tags() : of([]),
            customData.scheduleTypeKey ? customData.scheduleTypeKey() : of(''),
            customData.receivers ? customData.receivers() : of([]),
            customData.linkedWorkflow ? customData.linkedWorkflow() : of([]),
            customData.assignedUsers ? customData.assignedUsers() : of([]),
            customData.beginDate ? customData.beginDate({ formatted: true}) : of(''),
            customData.endDate ? customData.endDate({ formatted: true}) : of(''),
            customData.repetitionMode ? customData.repetitionMode() : of(''),
            customData.scheduleStatus ? customData.scheduleStatus() : of(''),
            customData.scheduleTitle ? customData.scheduleTitle() : of(''),
            customData.profiles ? customData.profiles() : of([]),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-031', err, TaskScheduleCreateError);
            }),
            map((values: any[]) => {

                const smartObjects: SmartObjectDto[] = _.isArray(values[0]) ? values[0] : [values[0]];
                const tags: [] = values[1];
                const typeKey = values[2];
                const receivers: UserDto[] = _.isArray(values[3]) ? values[3] : [values[3]];
                const workflows: WorkflowModelDto[] = _.isArray(values[4]) ? values[4] : [values[4]];
                const users: UserDto[] | string[] = _.isArray(values[5]) ? values[5] : [values[5]];
                const startDate: Date = (values[6]) ? new Date(values[6]) : null;
                const endDate: Date = (values[7]) ? new Date(values[7]) : null;
                const repetitionMode = values[8];
                const scheduleStatus = values[9];
                const titleWorkflow = values[10];

                const workflowUuid = this._task.instance.workflowModel.uuid;

                const agenda = this._loadSettingsAgenda(workflowUuid,
                    this._task.instance.context.settings.agenda, this._task.instance.context.user);
                const selectedSchedule: AgendaTypeDto = this._loadSchedule(agenda, typeKey);
                if (!selectedSchedule) {
                    throw new TaskScheduleCreateError('ERR-032','{{SCHEDULE-NOT-FOUND}}');
                }

                const enterTags: string[] = this.scheduleUtils.recuperationTags(tags, selectedSchedule);
                const enterReceivers: ScheduleReceiverDto[] =
                    this.scheduleUtils.recuperationReceivers(receivers, selectedSchedule, this._task.instance.context.groups);
                const enterWorkFlows: ScheduleWorkflowDto[] = this.scheduleUtils.recuperationWorkflows(workflows, selectedSchedule);

                const schedule: ScheduleDto = this.scheduleUtils.constructionSchedule(selectedSchedule, smartObjects, enterTags,
                    users, titleWorkflow, startDate, endDate, enterReceivers, enterWorkFlows, repetitionMode, scheduleStatus,
                    this._task.instance.context.user);
                if (!schedule) {
                    throw new TaskScheduleCreateError('ERR-033','{{SCHEDULE-CANT-BE-CREATED}}');
                }
                return this._createSchedule(schedule);
            })
        );
    }

    _loadSettingsAgenda(workflowUuid: string, agenda: AgendaTypeDto[], user: UserDto): ScheduleOption[] {
        return this.scheduleUtils.loadListSettingsAgenda(agenda, workflowUuid, user);
    }

    _createSchedule(schedule: ScheduleDto): InterpretorValidateDto {

        const transfers: InterpretorTransferTransitionDto[] = [];
        transfers.push({
            saveOnApi: false,
            type: 'sysobjects',
            value: this.sysUtils.transform(schedule, 'sys:schedule', this._task.instance.context.user.preferedLang)
        });
        transfers.push({
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'create-schedule',
                value: schedule
            }
        });

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers
        };
        return validation;
    }

    _loadSchedule(listAgenda: ScheduleOption[], selectedKey): AgendaTypeDto {
        const findAgenda = _.find(listAgenda, (agenda: ScheduleOption) => agenda.value === selectedKey);
        if (!findAgenda) {
            throw new TaskScheduleCreateError('ERR-034','{{AGENDA-NOT-FOUND}}');
        }
        return findAgenda.schedule;
    }

}
