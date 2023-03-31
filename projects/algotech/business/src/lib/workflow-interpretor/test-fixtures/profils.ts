import { WorkflowParticipantDto } from '@algotech-ce/core';

export const fixtUserTechician1: WorkflowParticipantDto = {
    user: 'jbernard',
    profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
    active: false
};

export const fixtUserTechician2: WorkflowParticipantDto = {
    user: 'jgodrie',
    profil: 'f57fec2c-1d8c-11e9-ab14-d663bd873d93',
    active: false
};

export const fixtUserAdmin1: WorkflowParticipantDto = {
    user: 'jford',
    profil: '35a5ffe4-1d8d-11e9-ab14-d663bd873d93',
    active: false
};

export const fixtParticipantsEmpty: WorkflowParticipantDto[] = [];
export const fixtParticipantsTechnician1: WorkflowParticipantDto[] = [
    fixtUserTechician1
];
export const fixtParticipantsTechnician1AndAdmin1: WorkflowParticipantDto[] = [
    fixtUserTechician1,
    fixtUserAdmin1
];
