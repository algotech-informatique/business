import { Injectable, EventEmitter } from '@angular/core';
import {
    PairDto, WorkflowSettingsDto, WorkflowModelDto,
    WorkflowVariableModelDto, SmartObjectDto, SmartModelDto,
    SettingsDto, WorkflowSettingsSecurityGroupsDto, ScheduleWorkflowDto,
    WorkflowProfilModelDto, TaskModelDto, ScheduleDto, WorkflowInstanceDto, SnPageEventDto, SnPageEventPipeDto
} from '@algotech-ce/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import {
    AuthService,
    sources, SettingsDataService, TranslateLangDtoService, DataService
} from '@algotech-ce/angular';
import { Observable, from, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { UUID } from 'angular2-uuid';
import { WorkflowUtilsService } from '../workflow-interpretor/workflow-utils/workflow-utils.service';
import { WorkflowSubjectService } from '../workflow-interpretor/workflow-subject/workflow-subject.service';
import { WorkflowContainerComponent } from '../workflow-container/workflow-container.component';
import { WorkflowSettingsFilterDto } from '@algotech-ce/core';
import { SoUtilsService } from '../workflow-interpretor/@utils/so-utils.service';
import { WorkflowLauncherComponent } from './workflow.launcher.component';
import { InterpretorSubjectDto } from '../../../interpretor/src/dto';
import { CustomOptionListComponent } from '../@components/custom-popover/custom-option-list/custom-option-list.component';
import { ToastService } from '../@services/toast.service';
import { WorkflowDialogService } from '../workflow-dialog/workflow-dialog.service';
import { SysUtilsService } from '../workflow-interpretor/@utils/sys-utils.service';

@Injectable()
export class WorkflowLaunchService {

    subscriber;

    private source = null;
    private attachedData: any = {};

    settings: SettingsDto;

    constructor(
        private dataService: DataService,
        private workflowUtilsService: WorkflowUtilsService,
        private translateLangDtoService: TranslateLangDtoService,
        private translate: TranslateService,
        private modalController: ModalController,
        private popoverController: PopoverController,
        private settingsDataService: SettingsDataService,
        private authService: AuthService,
        private soUtilsService: SoUtilsService,
        private workflowSubjectService: WorkflowSubjectService,
        private sysUtilsService: SysUtilsService,
        private toastService: ToastService) {
        this.source = _.cloneDeep(sources);
    }

    public setAdditional(path: 'smart-object' | 'smart-model' | 'poi', value: any) {
        this.attachedData[path] = value;
    }

    public setCurrentUser() {
        const setUser = () => {
            this.setSourceValue('current-user',
                this.sysUtilsService.transform(this.authService.localProfil.user, 'sys:user', null,
                    this.authService.localProfil.key));
        }

        this.authService.accessToken.subscribe(() => {
            setUser();
        });
        setUser();
    }

    public setSourceValue(path, value) {
        if (path in this.source) {
            this.source[path].value = value;
        } else {
            return null;
        }
    }

    public getSourceValue(path) {
        if (path in this.source) {
            return this.source[path].value;
        } else {
            return null;
        }
    }

    public getAvailableWorkflowsApp(ev: SnPageEventDto, source: PairDto[]): WorkflowSettingsDto[] {
        return _.compact(ev.pipe.map((pipe: SnPageEventPipeDto) => {
            return this.getAvailableWorkflowsAppAction(pipe, source);
        }));
    }

    getAvailableWorkflowsAppAction(action: SnPageEventPipeDto, source: PairDto[]) {
        // workflow
        const findWorkflow: WorkflowModelDto =
            _.find(this.settingsDataService.workflows, (workflow: WorkflowModelDto) => workflow.key === action.action);

        for (const pair of action.custom?.pair ? action.custom.pair : []) {
            if (pair.profiles.length === 0) {
                continue;
            }
            const launcher = pair.profiles[0];
            const others = _.drop(pair.profiles).map((item) => {
                return {
                    profil: item.uuid,
                    group: item.groups[0],
                    login: '',
                };
            });
            for (const grp of launcher.groups) {
                const securityGroup: WorkflowSettingsSecurityGroupsDto[] = [{
                    profil: launcher.uuid,
                    group: grp,
                    login: '',
                }, ...others];

                if (this.isAvailableWorkflow(findWorkflow, null, securityGroup, source)) {
                    const settings: WorkflowSettingsDto = {
                        uuid: UUID.UUID(),
                        context: 'app',
                        platforms: ['mobile', 'desktop'],
                        filters: [],
                        securityGroup,
                        workflowUuid: findWorkflow.uuid,
                        savingMode: action.custom.savingMode,
                        unique: action.custom.unique,
                    };
                    return settings;
                }
            }
        }
        return null;
    }

    public getAvailableWorkflows(context: string, platform: string): WorkflowSettingsDto[] {
        return _.uniqBy(
            _.filter(this.settingsDataService.settings.workflows, (wSetting: WorkflowSettingsDto) => {

                // context
                if (wSetting.context !== context) {
                    return false;
                }

                // platform
                if (wSetting.platforms.indexOf(platform) === -1) {
                    return false;
                }

                // workflow
                const findWorkflow: WorkflowModelDto =
                    _.find(this.settingsDataService.workflows, (workflow: WorkflowModelDto) => workflow.uuid === wSetting.workflowUuid);

                return this.isAvailableWorkflow(findWorkflow, wSetting.filters, wSetting.securityGroup);
            }),
            'workflowUuid'
        );
    }

    public isAvailableWorkflow(
        workflow: WorkflowModelDto,
        filters: WorkflowSettingsFilterDto[],
        securityGroup: WorkflowSettingsSecurityGroupsDto[],
        source?: PairDto[]) {
        if (!workflow || !securityGroup) {
            return false;
        }

        // owner
        const wfi: any = { workflowModel: workflow };
        let firstTask: TaskModelDto = null;
        try {
            firstTask = this.workflowUtilsService.findFirstTaskModel(wfi).task as TaskModelDto;
        } catch {
        }
        const profil: WorkflowSettingsSecurityGroupsDto = _.find(securityGroup, (sGroup) => {
            return firstTask && sGroup.profil === firstTask.general.profil;
        });

        if (!profil || (this.authService.localProfil.groups.indexOf(profil.group) === -1 &&
            this.authService.localProfil.login !== profil.login)) {
            return false;
        }

        // data
        return this.dataMatched(workflow, filters, source);
    }

    private dataMatched(workflow: WorkflowModelDto, filters: WorkflowSettingsFilterDto[], source?: PairDto[]) {
        // check all variables correct
        const data = source ? source : this.computeParameters(workflow);
        const variables = workflow.variables;
        return this.dataMatched_filters(filters) && _.every(variables, (variable: WorkflowVariableModelDto) => {

            // variable must have type
            if (!variable.type) {
                return false;
            }

            // data have to mapped with variable, data must have value
            const findData: PairDto = _.find(data, (d: PairDto) => d.key === variable.key);
            if (!findData || findData.value == null) {
                return false;
            }

            // check data
            if (variable.key === 'smart-object-selected' || variable.key === 'smart-objects-selected') {
                const object = !_.isArray(findData.value) ? findData.value : findData.value.length > 0 ? findData.value[0] : null;
                if (!object) {
                    return false;
                }

                let smartObject = null;
                let smartModel = null;
                let uuid = null;

                if (object.modelKey) {
                    smartObject = object;
                    uuid = object.uuid;
                    smartModel = this.settingsDataService.smartmodels.find((sm) => sm.key === smartObject?.modelKey);
                } else {
                    uuid = object;
                    smartObject = this.attachedData['smart-object'];
                    smartModel = this.attachedData['smart-model'];
                }

                // check attached data
                if (!this.attachedData || !smartObject || !smartModel ||
                    smartObject.uuid !== uuid || smartModel.key !== smartObject.modelKey) {
                    throw new Error('attached data corrupted');
                }

                if (variable.type !== 'so:*') {
                    if (variable.type.startsWith('so:')) {
                        if (variable.type.replace('so:', '') !== smartModel.key) {
                            return false;
                        }
                    } else if (variable.type.startsWith('sk:')) {
                        // test de la skills avec le model
                        if (smartModel.skills[variable.type.replace('sk:', '')] !== true) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }

            return true;
        });
    }

    private dataMatched_filters(filters: WorkflowSettingsFilterDto[]) {
        if (!filters || filters.length === 0) {
            return true;
        }
        // check one or more
        return _.some(filters, (filter: WorkflowSettingsFilterDto) => {
            switch (filter.filterKey) {
                case 'by-model':
                    return this.attachedData['smart-model'] && this.attachedData['smart-model'].key === filter.filterValue;
                case 'by-property': {
                    return this.soUtilsService.respectConditions(filter.filterValue, this.attachedData['smart-object']);
                }
                case 'by-poi':
                    return this.attachedData.poi === filter.filterValue;
                default:
                    return true;
            }
        });
    }

    public computeParameters(workflow?: WorkflowModelDto): PairDto[] {
        if (!workflow) {
            const result: PairDto[] = [];
            for (const key in this.source) {
                if (this.source.hasOwnProperty(key)) {
                    const value = this.getSourceValue(key);
                    if (value) {
                        result.push({
                            key,
                            value,
                        });
                    }
                }
            }
            return result;
        }
        return _.map(workflow.variables, (variable: WorkflowVariableModelDto) => {
            return {
                key: variable.key,
                value: this.getSourceValue(variable.key),
            };
        });
    }

    private launchModel(workflow: WorkflowModelDto, wSettings: WorkflowSettingsDto, cbSaved?: (instance?: WorkflowInstanceDto) => void) {
        const inputs: PairDto[] = this.computeParameters(workflow);
        this.launch({ workflowModelKey: workflow.key, settings: wSettings, inputs }, cbSaved);
    }

    public launchInstance(workflowInstance: string, cbSaved?: (instance?: WorkflowInstanceDto) => void) {
        this.launch({ workflowInstance }, cbSaved);
    }

    public async launch(
        data: {
            workflowModelKey?: string,
            settings?: WorkflowSettingsDto,
            inputs?: PairDto[],
            workflowInstance?: string
        },
        cbSaved?: (instance?: WorkflowInstanceDto) => void) {
        const onFinished = new EventEmitter<any>();
        const onClose = new EventEmitter<any>();

        const componentProps = {
            workFlowModelKey: data.workflowModelKey,
            workFlowInstance: data.workflowInstance,
            settings: data.settings,
            inputs: data.inputs,
            finished: onFinished,
            closed: onClose,
            history: this.dataService.mobile,
        };

        const top = await this.modalController.getTop();
        if (top) {
            await this.modalController.dismiss();
        }

        const form = await this.modalController.create({
            component: WorkflowContainerComponent,
            componentProps,
            cssClass: this.dataService.mobile ? 'workflow-mobile' : 'workflow',
        });
        onClose.subscribe(() => form.dismiss());

        if (this.subscriber) {
            this.subscriber.unsubscribe();
            this.subscriber = null;
        }
        this.subscriber = this.workflowSubjectService.subject.subscribe((res: InterpretorSubjectDto) => {
            if (res.success) {
                if (res.action === 'operations') {
                    if (cbSaved) {
                        cbSaved(res.value as WorkflowInstanceDto);
                    }
                    if (this.subscriber) {
                        this.subscriber.unsubscribe();
                        this.subscriber = null;
                    }
                }
            }
        });
        return await form.present();
    }

    public launchEventsWithWorkflows(
        e: Event,
        workflowsSettings: WorkflowSettingsDto[],
        hidePopover: boolean,
        cbSaved: (instance?: WorkflowInstanceDto) => void = null) {
        const myEmitter = new EventEmitter<any>();

        const closed = new EventEmitter<any>();
        closed.subscribe(() => {
            this.modalController.dismiss();
        });

        if (workflowsSettings.length === 0) {
            this.toastService.presentToast(this.translate.instant('NO-WORKFLOW-AVAILABLE'), 2000);
            return of(null);
        }

        let $launcher: Observable<{ workflow?: string, instance?: string }>;
        if (hidePopover && workflowsSettings.length === 1) {
            $launcher = of({ workflow: workflowsSettings[0].workflowUuid });
        } else {
            const paramController = {
                component: WorkflowLauncherComponent,
                componentProps: {
                    launched: myEmitter,
                    closed,
                    workflows: workflowsSettings,
                    data: this.computeParameters(),
                },
                cssClass: 'workflow-launcher',
                event: e
            };
            const pageCtrl = this.dataService.mobile ? this.modalController : this.popoverController;
            $launcher = from(pageCtrl.create(paramController)).pipe(
                mergeMap((popover) => from(popover.present()).pipe(
                    mergeMap(() => myEmitter),
                    tap(() => pageCtrl.dismiss()),
                )));
        }
        $launcher.pipe(
            map((response) => {
                if (response) {
                    const wSettings: WorkflowSettingsDto = _.find(workflowsSettings, { workflowUuid: response.workflow });
                    const workflow = _.find(this.settingsDataService.workflows, { uuid: response.workflow });

                    return { workflow, wSettings, instance: response.instance };
                }
                return null;
            })
        ).subscribe((response) => {
            if (response.instance) {
                this.launchInstance(response.instance, cbSaved);
            } else {
                this.launchModel(response.workflow, response.wSettings, cbSaved);
            }
        },
            err => console.error(`Change data failed: ${err}`));
    }

    public launchEvents(
        e: Event,
        context: string,
        platform: string,
        hidePopover: boolean,
        cbSaved: () => void = null) {
        return this.launchEventsWithWorkflows(e, this.getAvailableWorkflows(context, platform), hidePopover, cbSaved);
    }

    public launchSchedules(e, schedule: ScheduleDto, hidePopover: boolean, cbSaved: () => void = null) {
        const myEmitter = new EventEmitter<any>();

        if (schedule.workflows.length === 0) {
            return of(null);
        }
        const workflows: PairDto[] = this.displayWorkflow(schedule.workflows);
        let $launcher: Observable<{ uuid: string, popover?}>;
        if (hidePopover && schedule.workflows.length === 1) {
            $launcher = of({ uuid: workflows[0].key });
        } else {
            $launcher = from(this.popoverController.create({
                component: CustomOptionListComponent,
                componentProps: {
                    optionEmitter: myEmitter,
                    listOption: workflows
                },
                event: e
            })).pipe(
                mergeMap((popover) => from(popover.present()).pipe(
                    mergeMap(() => myEmitter),
                    map((uuid: string) => ({ uuid, popover }))))
            );
        }
        $launcher.pipe(
            map((response) => {
                if (response) {
                    const findWorkflow: WorkflowModelDto =
                        _.find(this.settingsDataService.workflows, (workflow: WorkflowModelDto) => workflow.uuid === response.uuid);
                    const wSettings: WorkflowSettingsDto = this.createSettings(response.uuid, findWorkflow);

                    if (schedule.soUuid.length > 0) {
                        this.setSourceValue('smart-object-selected', schedule.soUuid[0]);
                        this.setSourceValue('smart-objects-selected', schedule.soUuid);
                    }
                    const loadedInputs: PairDto[] = this.computeParameters(findWorkflow);

                    return { findWorkflow, wSettings, loadedInputs, popover: response.popover };
                }
                return null;
            })
        ).subscribe((response) => {
            if (response) {
                const data = {
                    workflowModelKey: response.findWorkflow.key,
                    settings: response.wSettings,
                    inputs: response.loadedInputs,
                };
                this.launch(data, cbSaved);
                if (response.popover) {
                    response.popover.dismiss();
                }
            }
        },
            err => console.error(`Change data failed: ${err}`));
    }

    private createSettings(wfUuid: string, workflow: WorkflowModelDto): WorkflowSettingsDto {
        return {
            uuid: UUID.UUID(),
            context: 'agenda',
            platforms: ['mobile'],
            filters: [],
            savingMode: 'END',
            securityGroup: this.createSecurityGroups(workflow),
            workflowUuid: wfUuid,
            unique: true,
        };
    }

    private displayWorkflow(workflows: ScheduleWorkflowDto[]): PairDto[] {
        return _.reduce(workflows, (results, wf: ScheduleWorkflowDto) => {
            const findWorkflow: WorkflowModelDto =
                _.find(this.settingsDataService.workflows, (workflow: WorkflowModelDto) => workflow.uuid === wf.workflowUuid);

            if (findWorkflow) {
                const pair: PairDto = {
                    key: wf.workflowUuid,
                    value: [this.translateLangDtoService.transform(findWorkflow.displayName)],
                };
                results.push(pair);
            }

            return results;
        }, []);
    }

    private createSecurityGroups(workflow: WorkflowModelDto): WorkflowSettingsSecurityGroupsDto[] {
        const securityGroup: WorkflowSettingsSecurityGroupsDto[] = [];
        _.map(workflow.profiles, (profil: WorkflowProfilModelDto) => {
            const secu: WorkflowSettingsSecurityGroupsDto = {
                group: this.authService.localProfil.groups[0],
                login: '',
                profil: profil.uuid
            };
            securityGroup.push(secu);
        });
        return securityGroup;
    }
}
