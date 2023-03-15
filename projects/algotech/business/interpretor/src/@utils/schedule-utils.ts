import {
    SmartObjectDto, ScheduleDto, ScheduleReceiverDto, ScheduleWorkflowDto,
    UserDto, GroupDto, WorkflowModelDto, WorkflowSettingsSecurityGroupsDto, WorkflowProfilModelDto,
    WorkflowVariableModelDto, WorkflowEventParameterDto, AgendaTypeDto
} from '@algotech/core';
import moment from 'moment';

import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import { InterpretorAbstract } from '../interpretor-abstract/interpretor-abstract';
import { InterpretorTaskDto } from '../dto';

export class ScheduleUtils {

    constructor(private interpretorAbstract: InterpretorAbstract) { }

    constructionSchedule(selectSchedule: AgendaTypeDto, smartObjects: SmartObjectDto[], enterTags: string[], users: UserDto[] | string[],
        titleWorkflow: string, startDate: Date, endDate: Date, enterReceivers: ScheduleReceiverDto[], enterWorkFlows: ScheduleWorkflowDto[],
        repetitionMode: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly', scheduleStatus: string, user: UserDto
    ): ScheduleDto {

        return {
            uuid: UUID.UUID(),
            soUuid: _.map(smartObjects, (so: SmartObjectDto) => so.uuid),
            tags: enterTags,
            assignedUserUuid: _.map(users, (u) => !u ? null : u.uuid ? u.uuid : u),
            scheduleTypeKey: selectSchedule.key,
            title: titleWorkflow,
            creationDate: moment().toISOString(),
            beginPlannedDate: (startDate) ? moment(startDate).toISOString() : '',
            endPlannedDate: (endDate) ? moment(endDate).toISOString() : '',
            emitterUuid: user.uuid,
            receivers: enterReceivers,
            workflows: enterWorkFlows,
            repetitionMode: repetitionMode,
            scheduleStatus: scheduleStatus,
            activities: [],
            source: 'algotech'
        };
    }

    recuperationTags(tags: string[], schedule: AgendaTypeDto): string[] {
        const enterTags: string[] = _.cloneDeep(schedule.defaultTags);
        if (tags.length !== 0) {
            _.map(tags, (tag: string) => {
                if (_.findIndex(enterTags, (enter: string) => enter === tag) === -1) {
                    enterTags.push(tag);
                }
            });
        }
        return enterTags;
    }

    recuperationReceivers(receivers: UserDto[], schedule: AgendaTypeDto, groups: GroupDto[]): ScheduleReceiverDto[] {
        const enterReceivers: ScheduleReceiverDto[] = _.cloneDeep(schedule.defaultReceivers);
        if (receivers.length !== 0) {
            const readReceivers: ScheduleReceiverDto[] = this._createReceivers(receivers, groups);
            _.map(readReceivers, (receiver: ScheduleReceiverDto) => {
                if (_.findIndex(enterReceivers, (rec: ScheduleReceiverDto) => rec === receiver) === -1) {
                    enterReceivers.push(receiver);
                }
            });
        }
        return enterReceivers;
    }

    recuperationWorkflows(workflows: WorkflowModelDto[], schedule: AgendaTypeDto): ScheduleWorkflowDto[] {
        const enterWorkFlows: ScheduleWorkflowDto[] = _.cloneDeep(schedule.defaultWorkflowModels);
        if (workflows.length !== 0) {
            const schWF: ScheduleWorkflowDto[] = this._createWorkflowSchedule(workflows);
            _.map(schWF, (wf: ScheduleWorkflowDto) => {
                if (_.findIndex(enterWorkFlows, (w: ScheduleWorkflowDto) => w.workflowUuid === wf.workflowUuid) === -1) {
                    enterWorkFlows.push(wf);
                }
            });
        }
        return enterWorkFlows;
    }

    getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    private _createReceivers(receivers: UserDto[], groups: GroupDto[]): ScheduleReceiverDto[] {
        const returnReceivers: ScheduleReceiverDto[] = [];
        _.map(receivers, (us: UserDto) => {
            _.map(this._getUserGroup(us.groups, groups), (gr: string) => {
                const receiver: ScheduleReceiverDto = {
                    groupUuid: gr,
                    userUuid: us.uuid,
                    permission: 'RW'
                };
                returnReceivers.push(receiver);
            });
        });
        return returnReceivers;
    }

    private _getUserGroup(usGroups: string[], groups: GroupDto[]): string[] {
        return _.map(usGroups, (group) => {
            return _.find(groups, (gr: GroupDto) => gr.key === group.key).uuid;
        });
    }

    private _createWorkflowSchedule(workflows: WorkflowModelDto[]): ScheduleWorkflowDto[] {
        return _.map(workflows, (myWf: WorkflowModelDto) => {
            const securityGroup: WorkflowSettingsSecurityGroupsDto[] = _.map(myWf.profiles, (p: WorkflowProfilModelDto) => {
                return {
                    profil: p.uuid,
                    group: '',
                    login: '',
                };
            });

            const scheduleWF: ScheduleWorkflowDto = {
                workflowUuid: myWf.uuid,
                parameters: this._createParameters(myWf.variables),
                profils: securityGroup
            };
            return scheduleWF;
        });
    }

    private _createParameters(wfVariables: WorkflowVariableModelDto[]): WorkflowEventParameterDto[] {
        const wfEvent: WorkflowEventParameterDto[] = _.map(wfVariables, (variable: WorkflowVariableModelDto) => {
            const event: WorkflowEventParameterDto = {
                key: variable.key,
                source: variable.type
            };
            return event;
        });
        return wfEvent;
    }

    loadListSettingsAgenda(
        agenda: AgendaTypeDto[],
        activeWorkFlowUuid: string,
        user: UserDto): { value: string, text: string, schedule: AgendaTypeDto }[] {

        return _.reduce(agenda, (results, myAgenda: AgendaTypeDto) => {
            if ((user.groups.indexOf(myAgenda.owner) > -1)
                && (myAgenda.workflowUuid === activeWorkFlowUuid)) {
                results.push({
                    value: myAgenda.key,
                    text: this.interpretorAbstract.transform(myAgenda.displayName, user.preferedLang),
                    schedule: myAgenda,
                });
            }
            return results;
        }, []);
    }

    loadListSettingsStatusGroup(agenda: AgendaTypeDto[], user: UserDto): string {

        const findAgenda = _.find(agenda, (myAgenda: AgendaTypeDto) => {
                return user.groups.indexOf(myAgenda.owner) > -1;
        });

        if (findAgenda) {
            return findAgenda.statutGroupList;
        } else {
            throw new Error('Type not found');
        }
    }
}
