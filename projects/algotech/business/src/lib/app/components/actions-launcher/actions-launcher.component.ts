import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import {
    WorkflowModelDto, PairDto, WorkflowInstanceAbstractDto, WorkflowSettingsDto, TaskModelDto,
    WorkflowInstanceDto,
    SnPageEventPipeDto,
    ApplicationModelDto
} from '@algotech/core';
import { WorkflowInstancesService, SettingsDataService, AuthService, DataService, TranslateLangDtoService } from '@algotech/angular';
import * as _ from 'lodash';
import { concat, Observable, Subscription, zip } from 'rxjs';
import { ActionsLauncherData, ActionsLauncherEvent } from '../../models';
import { first, map, mergeMap, tap, toArray } from 'rxjs/operators';
import { WorkflowLaunchService } from '../../../workflow-launcher/workflow-layout.lancher.service';
import { TranslateService } from '@ngx-translate/core';
import { PageUtilsService } from '../../services/page-utils.service';

interface IActionDisplay {
    action: SnPageEventPipeDto;
    displayType: string;
    displayName: string;
    iconName: string;
    inputs: PairDto[];
    workflow?: IWorkflowDisplay;
}

interface IWorkflowDisplay {
    action: SnPageEventPipeDto;
    workflow: WorkflowModelDto;
    instances: WorkflowInstanceAbstractDto[];
    settings: WorkflowSettingsDto;
    disabled: boolean;
    unique: boolean;
}

@Component({
    selector: 'actions-launcher',
    templateUrl: 'actions-launcher.component.html',
    styleUrls: ['./actions-launcher.component.scss']
})

export class ActionsLauncherComponent implements OnInit, OnDestroy {
    @Input()
    actions: ActionsLauncherData[];

    @Input()
    appModel: ApplicationModelDto;

    @Output()
    launched = new EventEmitter<ActionsLauncherEvent>();

    @Output()
    closed = new EventEmitter();

    loading = true;
    modalControl = false;
    actionsDisplay: IActionDisplay[];
    activeDisplay: IWorkflowDisplay;
    subscription: Subscription;

    constructor(
        private translateLang: TranslateLangDtoService,
        private translate: TranslateService,
        private dataService: DataService,
        private workflowInstance: WorkflowInstancesService,
        private settingsDataService: SettingsDataService,
        private workflowLauncher: WorkflowLaunchService,
        private pageUtils: PageUtilsService,
        private authService: AuthService) { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.modalControl = this.dataService.mobile;

        // first loading
        const resolve$ = this.actions.map((item) => item.inputs.pipe(
            map((inputs) => {
                const actionDisplay: IActionDisplay = {
                    action: item.action,
                    iconName: '',
                    inputs,
                    displayName: item.action.action,
                    displayType: this.translate.instant('SN-APP.WIDGET.EVENT.TYPE.' + (item.action.type.toUpperCase()))
                };

                return this.completeActions(item, inputs, actionDisplay);
            }),
            first()
        ));

        this.subscription = concat(...resolve$).pipe(
            toArray(),
            tap((actions: IActionDisplay[]) => this.actionsDisplay = _.compact(actions)),
            mergeMap(() => {
                // second loading (with call api) instances
                this.loading = false;
                return concat(..._.compact(this.resolveInstances()));

            })
        ).subscribe();
    }

    completeActions(item: ActionsLauncherData, inputs: PairDto[], actionDisplay: IActionDisplay): IActionDisplay {
        switch (item.action.type) {
            case 'call::onLoad': {
                actionDisplay.iconName = 'fa-solid fa-rotate';
                const widget = this.pageUtils.getWidgets(this.appModel.snApp).find((w) => w.id === item.action.action);
                if (widget) {
                    actionDisplay.displayName = widget.name;
                }
            }
                break;
            case 'page': {
                actionDisplay.iconName = 'fa-solid fa-window-maximize';
                const page = this.appModel.snApp.pages.find((p) => p.id === item.action.action);
                if (page) {
                    actionDisplay.displayName = this.translateLang.transform(page?.displayName);
                }
            }
                break;
            case 'url': {
                actionDisplay.iconName = 'fa-solid fa-link';
            }
                break;
            case 'page::nav': {
                actionDisplay.iconName = 'fa-solid fa-window-maximize';
                const app = this.settingsDataService.apps.find((app) => app.key === item.action.action);
                if (app) {
                    actionDisplay.displayName = this.translateLang.transform(app.displayName);
                }
            }
                break;
            case 'smartflow': {
                actionDisplay.iconName = 'fa-solid fa-atom';
            }
                break;
            case 'workflow': {

                const settings = this.workflowLauncher.getAvailableWorkflowsAppAction(item.action, inputs);
                if (!settings) {
                    return null;
                }

                const workflow = this.settingsDataService.workflows.find((wf) => wf.uuid ===
                    settings.workflowUuid);

                const workflowDisplay = {
                    workflow,
                    action: item.action,
                    settings,
                    instances: null,
                    disabled: false,
                    unique: false,
                };

                actionDisplay.iconName = workflow.iconName;
                actionDisplay.displayName = this.translateLang.transform(workflow.displayName);
                actionDisplay.workflow = workflowDisplay;
            }
                break;
        }

        return actionDisplay;
    }

    resolveInstances(): Observable<any>[] {
        return this.actionsDisplay.map((action) => {
            if (!action.workflow) {
                return null;
            }

            const exclude = ['current-user'];
            const data = _.reject(action.inputs, (d) => exclude.includes(d.key));

            return this.workflowInstance.getByModel([action.workflow.workflow.uuid], data).pipe(
                tap((allInstances: WorkflowInstanceAbstractDto[]) => {

                    const instancesForWf = _.filter(allInstances, (instance: WorkflowInstanceAbstractDto) => {
                        return instance.workflowModelUuid === action.workflow.workflow.uuid;
                    });

                    const instances: WorkflowInstanceAbstractDto[] =
                        _.map(
                            _.orderBy(
                                _.filter(instancesForWf, (instance: WorkflowInstanceAbstractDto) => {
                                    return _.find(instance.participants, p =>
                                        p.user === this.authService.localProfil.login) !== undefined;
                                }),
                                'updateDate', 'desc'
                            ),
                            (instance: WorkflowInstanceAbstractDto) => {
                                // active task, active step, workflow waiting?
                                const workflow: WorkflowModelDto = action.workflow.workflow;
                                const tasks: TaskModelDto[] = [];
                                for (const s of workflow.steps) {
                                    for (const t of s.tasks) {
                                        tasks.push(t);
                                    }
                                }
                                const participant = _.find(instance.participants, p => p.user === this.authService.localProfil.login);

                                const task = _.find(tasks, (t) => t.uuid === instance.activeTask);
                                const step: string = _.find(action.workflow.workflow.steps,
                                    (s) => s.tasks.indexOf(task) !== -1);
                                return _.assign(instance, { step, task, waiting: !participant.active });
                            }
                        );

                    // unique
                    if (action.workflow.settings.unique) {
                        action.workflow.unique = true;

                        // no instance for user but instance for current workflow already started by other
                        if (instances.length === 0 && instancesForWf.length > 0) {
                            action.workflow.disabled = true;
                        }
                    }
                    action.workflow.instances = instances;
                }),
            )
        });
    }

    onClick(item: IActionDisplay) {
        this.activeDisplay = null;

        if (!item.workflow || !item.workflow.instances || item.workflow.instances.length === 0) {
            // workflow (no instance)
            this.launched.emit({ action: item.action });
        } else {
            this.activeDisplay = item.workflow;
            // workflow (instance) up the scrollbar on click detail
            const popover = document.getElementsByClassName('popover-content');
            if (popover.length > 0) {
                document.getElementsByClassName('popover-content')[0].scrollTop = 0;
            }
        }
    }

    remove($event: Event, index: number) {
        if ($event) {
            $event.stopPropagation();
        }

        const instance = this.activeDisplay.instances[index];
        if (instance.participants.length > 1) {
            return;
        }

        this.activeDisplay.instances.splice(index, 1);
        this.removeInstance(instance.uuid);

        // force to refresh main list
        if (this.activeDisplay.instances.length === 0) {
            this.activeDisplay = null;
        }
    }

    removeInstance(uuid: string) {
        this.dataService.get('wfi', uuid).pipe(
            mergeMap((wfi: WorkflowInstanceDto) => {
                const delete$ = [];
                if (wfi) {
                    delete$.push(this.dataService.remove('wfi', uuid));
                    if (wfi.saved) {
                        delete$.push(this.workflowInstance.delete(uuid));
                    }
                } else {
                    delete$.push(this.workflowInstance.delete(uuid));
                }
                return zip(...delete$);
            })).subscribe();
    }

    onBack() {
        if (!this.activeDisplay) {
            this.closed.emit();
        }
        this.activeDisplay = null;
    }

    onLaunchInstance(instance: WorkflowInstanceDto) {
        this.launched.emit({ instance: instance.uuid });
    }

    onLaunchWorkflow(workflow: IWorkflowDisplay) {
        this.launched.emit({ action: workflow.action });
    }
}