import { Component, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
    WorkflowModelDto, PairDto, WorkflowSettingsDto, WorkflowProfilModelDto, WorkflowSettingsSecurityGroupsDto
} from '@algotech-ce/core';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import { SettingsDataService, EnvService, AuthService, LocalProfil } from '@algotech-ce/angular';
import { WorkflowSubjectService } from '../../workflow-interpretor/workflow-subject/workflow-subject.service';
import { Subscription } from 'rxjs';
import { InterpretorSubjectDto } from '../../../../interpretor/src';
import { debounceTime, filter } from 'rxjs/operators';
import { ThemeEngloberService } from '../../theme-englober/theme-englober.service';
import { AuthDebugService } from '../../@services/auth.debug.service';

@Component({
    selector: 'at-workflow-debugger-frame',
    templateUrl: './workflow-debugger-frame.component.html',
    styleUrls: ['./workflow-debugger-frame.component.scss'],
})

export class WorkflowDebuggerFrameComponent implements OnDestroy {

    @Input()
    workflow: WorkflowModelDto;

    prefilled: PairDto[] = [];
    inputs: PairDto[];
    settings: WorkflowSettingsDto;

    subscription: Subscription;

    handleLoadEvent = (e) => {
        this.envService.setEnvironment(e.detail.environment, e.detail.localProfil);
        this.authDebugService.overrideGetterLocalProfil(e.detail.localProfil).subscribe(() => {
            this.settingsDataService.glists = e.detail.glists;
            this.settingsDataService.groups = e.detail.groups;
            this.settingsDataService.settings = e.detail.settings;
            this.settingsDataService.smartmodels = e.detail.smartmodels;
            this.settingsDataService.tags = e.detail.tags;
            this.settingsDataService.workflows = [e.detail.workflow];
            this.settingsDataService.apps = e.detail.apps;
            this.themeEnglober.theme.next(this.settingsDataService.settings.theme);

            // change
            if (this.workflow) {
                this.workflow = null;
                this.ref.detectChanges();
            }
            this.workflow = e.detail.workflow;

            this.prefilled = e.detail.inputs;
            this.inputs = this.workflow.variables.length === 0 ? [] : null;

            this.createSettings(e.detail.localProfil.login);
        });
    }

    constructor(
        private ref: ChangeDetectorRef,
        private workflowSubjectService: WorkflowSubjectService,
        private envService: EnvService,
        private settingsDataService: SettingsDataService,
        private themeEnglober: ThemeEngloberService,
        private authDebugService: AuthDebugService) {

        // load
        window.document.removeEventListener('load', this.handleLoadEvent, false);
        window.document.addEventListener('load', this.handleLoadEvent, false);

        // action
        this.subscription = this.sendAction('debug');

        // notify ready
        const eventReady = new CustomEvent('ready');
        window.parent.document.dispatchEvent(eventReady);
    }

    sendAction(type: string) {
        return this.workflowSubjectService.subject.pipe(
            filter((res) => res.action === type),
            debounceTime(100),
        ).subscribe((res: InterpretorSubjectDto) => {
            const eventAction = new CustomEvent('action', { detail: res });
            window.parent.document.dispatchEvent(eventAction);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onStart(inputs: PairDto[]) {
        this.inputs = inputs;
    }

    private createSettings(login: string) {
        this.settings = {
            uuid: UUID.UUID(),
            context: 'debug',
            platforms: ['mobile', 'desktop'],
            filters: [],
            savingMode: 'DEBUG',
            securityGroup: _.map(this.workflow.profiles, (p: WorkflowProfilModelDto) => {
                const sGroup: WorkflowSettingsSecurityGroupsDto = {
                    profil: p.uuid,
                    group: '',
                    login,
                };
                return sGroup;
            }),
            workflowUuid: this.workflow.uuid,
            unique: true,
        };
    }
}
