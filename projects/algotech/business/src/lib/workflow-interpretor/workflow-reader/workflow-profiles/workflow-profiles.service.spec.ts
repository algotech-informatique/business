import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { fixtSettings, fixtSettingsNotValid, fixtWorkflowInstanceTodo } from '../../test-fixtures/workflow-instances';
import { fixtWorkflowModel1 } from '../../test-fixtures/workflow-models';
import { fixtParticipantsEmpty, fixtParticipantsTechnician1, fixtUserTechician1, fixtUserAdmin1 } from '../../test-fixtures/profils';
import { TestUtils } from '../../test-fixtures/mock/test-api-mock.utils';
import * as _ from 'lodash';
import { WorkflowInstanceDto } from '@algotech-ce/core';
import {
    WorkflowErrorUnauthorizedProfil,
    WorkflowErrorProfilNotFind,
    WorkflowErrorSettingsNotValid
} from '../../../../../interpretor/src/error/interpretor-error';
import { WorkflowProfilesService } from './workflow-profiles.service';
import { AuthMockService } from '../../test-fixtures/mock/auth.mock.service';
import { AppTestModule } from '../../test-fixtures/mock/app.test.module';

describe('WorkflowProfilService', () => {
    let workflowProfilService: WorkflowProfilesService;
    let utils: TestUtils;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([AuthMockService, WorkflowProfilesService],
        async (
            authService: AuthMockService,
            _workflowProfilService: WorkflowProfilesService) => {
            workflowProfilService = _workflowProfilService;
            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
        }));

    it('checkProfil - not signin', async () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'))).toBeFalsy();
    });

    it('checkProfil - error settings not valid', async () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);
        instance.settings = fixtSettingsNotValid;
        instance.participants = fixtParticipantsEmpty;

        expect(() => {
            workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'));
        }).toThrowError(WorkflowErrorSettingsNotValid);
    });

    it('checkProfil - initial', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jbernard', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'))).toBeTruthy();
    });

    it('checkProfil - bad profil', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'))).toBeFalsy();
    });

    it('checkProfil - good profil but started by another technician', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jgodrie', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsTechnician1;

        expect(workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'))).toBeFalsy();
    });

    it('checkProfil - change profil (bad profil)', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jbernard', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsTechnician1;

        expect(workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Reviewers'))).toBeFalsy();
    });

    it('checkProfil - change profil (good profil)', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsTechnician1;

        expect(workflowProfilService.checkProfil(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Reviewers'))).toBeTruthy();
    });

    it('updateParticipants - initial', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jbernard', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(workflowProfilService.updateParticipants(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'))).toEqual(
            jasmine.arrayContaining([
                Object.assign(_.cloneDeep(fixtUserTechician1), { active: true })
            ])
        );
    });

    it('updateParticipants - change profil', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsTechnician1;

        expect(workflowProfilService.updateParticipants(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Reviewers'))).toEqual(
            jasmine.arrayContaining([
                fixtUserTechician1,
                Object.assign(_.cloneDeep(fixtUserAdmin1), { active: true })
            ])
        );
    });

    it('updateParticipants - failed', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(() => {
            workflowProfilService.updateParticipants(instance, fixtWorkflowModel1.profiles.find((p) => p.name === 'Emitter'));
        }).toThrowError(WorkflowErrorUnauthorizedProfil);
    });

    it('transform - failed profil not find', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(() => {
            workflowProfilService.transform(instance, ['not find']);
        }).toThrowError(WorkflowErrorProfilNotFind);
    });

    it('transform - failed settings not valid', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettingsNotValid;
        instance.participants = fixtParticipantsEmpty;

        expect(() => {
            workflowProfilService.transform(instance, [fixtUserTechician1.profil]);
        }).toThrowError(WorkflowErrorSettingsNotValid);
    });

    it('transform - return group', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsEmpty;

        expect(workflowProfilService.transform(instance, [fixtUserTechician1.profil])).toEqual(['grp:technician']);
    });

    it('transform - return user inside participant', async () => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsTechnician1;

        expect(workflowProfilService.transform(instance, [fixtUserTechician1.profil])).toEqual([`usr:${fixtUserTechician1.user}`]);
    });
});
