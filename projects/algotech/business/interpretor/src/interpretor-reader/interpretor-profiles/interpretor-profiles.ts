
import { WorkflowProfilModelDto, WorkflowParticipantDto, WorkflowInstanceDto, UserDto } from '@algotech/core';
import * as _ from 'lodash';
import {
    WorkflowErrorUnauthorizedProfil,
    WorkflowErrorSettingsNotValid, WorkflowErrorProfilNotFind,
} from '../../error/interpretor-error';
import { InterpretorUtils } from '../../interpretor-utils/interpretor-utils';

export class InterpretorProfiles {
    constructor(
        protected workflowUtils: InterpretorUtils) {
    }

    public updateParticipants(instance: WorkflowInstanceDto, profil: WorkflowProfilModelDto): WorkflowParticipantDto[] {

        let participants: WorkflowParticipantDto[] = instance.participants;

        if (!this.checkProfil(instance, profil)) {
            throw new WorkflowErrorUnauthorizedProfil(instance, 'ERR-097', '');
        }

        const findParticipant = participants.find((p) => p.user === instance.context.user.username);
        if (!findParticipant) {
            participants = participants.map((participant: WorkflowParticipantDto) => {
                return Object.assign(participant, { active: false });
            });

            const _participant: WorkflowParticipantDto = {
                user: (instance.context.user as UserDto).username,
                active: true,
            };
            if (profil) {
                _participant.profil = profil.uuid;
            }
            participants.push(_participant);

        } else {
            participants = participants.map((participant: WorkflowParticipantDto) => {
                return Object.assign(participant, { active: participant.user === findParticipant.user });
            });
        }

        return participants;
    }

    public checkProfil(instance: WorkflowInstanceDto, profil: WorkflowProfilModelDto): boolean {

        if (!profil || this.workflowUtils.isReadonly(instance)) {
            return true;
        }
        const securityGroups = instance.settings.securityGroup.find((s) => s.profil === profil.uuid);
        if (!securityGroups) {
            throw new WorkflowErrorSettingsNotValid('ERR-103', '');
        }

        if (instance.context && instance.context.user &&
            (
                (instance.context.user.groups.find((g) => g === securityGroups.group || g === 'sadmin')) ||
                (instance.context.user.username === securityGroups.login)
            )
        ) {

            // aucun participant
            if (instance.participants.length === 0) {
                return true;
            }

            const findParticipant = instance.participants.find((p) => p.user === instance.context.user.username);

            // participant trouvé
            if (findParticipant) {
                return findParticipant.profil === profil.uuid;
            } else {

                // nouveau profil
                if (!instance.participants.find((p) => p.profil === securityGroups.profil)) {
                    return true;
                }
            }
        }

        return false;
    }

    public transform(instance: WorkflowInstanceDto, profiles: string[]): string[] {
        return profiles.map((profil) => {
            if (!instance.workflowModel.profiles.find((p) => p.uuid === profil)) {
                throw new WorkflowErrorProfilNotFind('ERR-105', `: ${profil}`);
            }
            const participant = instance.participants.find((p) => p.profil === profil);
            if (!participant) {
                const securityGroup = instance.settings.securityGroup.find((s) => s.profil === profil);
                if (!securityGroup) {
                    throw new WorkflowErrorSettingsNotValid('ERR-104', `{{NO-GROUP-FOR-PROFILE}} ${profil}`);
                }
                return securityGroup.group !== '' ? `grp:${securityGroup.group}` : `usr:${securityGroup.login}`;
            }
            return `usr:${participant.user}`;
        });
    }
}
