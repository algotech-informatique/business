import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import {
    WorkflowModelDto, PairDto, WorkflowInstanceAbstractDto, WorkflowSettingsDto, TaskModelDto,
    WorkflowInstanceDto
} from '@algotech-ce/core';
import { WorkflowInstancesService, SettingsDataService, AuthService, DataService, TranslateLangDtoService } from '@algotech-ce/angular';
import * as _ from 'lodash';
import { zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

interface IWorkflowDisplay {
    workflow: WorkflowModelDto;
    displayName: string;
    instances: WorkflowInstanceAbstractDto[];
    disabled: boolean;
    unique: boolean;
}

@Component({
    selector: 'at-workflow-launcher',
    styleUrls: ['./workflow.launcher.component.scss'],
    templateUrl: './workflow.launcher.component.html',
})

export class WorkflowLauncherComponent implements OnInit {
    @Input()
    workflows: WorkflowSettingsDto[];

    @Input()
    data: PairDto[];

    @Output()
    launched = new EventEmitter();

    @Output()
    closed = new EventEmitter();

    modalControl = false;
    workflowsDisplay: IWorkflowDisplay[] = [];
    activeDisplay: IWorkflowDisplay;

    subListLoading = false;
    disabled = false;

    constructor(
        private translateLang: TranslateLangDtoService,
        private dataService: DataService,
        private workflowInstance: WorkflowInstancesService,
        private settingsDataService: SettingsDataService,
        private authService: AuthService) { }

    ngOnInit() {
        this.modalControl = this.dataService.mobile;
        this.disabled = true;

        // first loading (workflow)
        this.workflowsDisplay =
            _.orderBy(
                _.map(this.workflows, (settings: WorkflowSettingsDto) => {
                    const workflow: WorkflowModelDto = _.find(this.settingsDataService.workflows, (wf) => wf.uuid ===
                    settings.workflowUuid);
                    const wfDisplay: IWorkflowDisplay = {
                        workflow,
                        displayName: this.translateLang.transform(workflow.displayName),
                        instances: [],
                        disabled: false,
                        unique: false,
                    };
                    return wfDisplay;
                }),
                'displayName'
            );

        // second loading (with call api) instances
        const exclude = ['current-user'];
        const data = _.reject(this.data, (d) => exclude.includes(d.key));
        this.workflowInstance.getByModel(this.workflows.map((s) => s.workflowUuid), data).subscribe(
            (allInstances: WorkflowInstanceAbstractDto[]) => {
                _.each(this.workflowsDisplay, (wfDisplay: IWorkflowDisplay) => {

                    const instancesForWf = _.filter(allInstances, (instance: WorkflowInstanceAbstractDto) => {
                        return instance.workflowModelUuid === wfDisplay.workflow.uuid;
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
                                const workflow: WorkflowModelDto = wfDisplay.workflow;
                                const tasks: TaskModelDto[] = [];
                                for (const s of workflow.steps) {
                                    for (const t of s.tasks) {
                                        tasks.push(t);
                                    }
                                }
                                const participant = _.find(instance.participants, p => p.user === this.authService.localProfil.login);

                                const task = _.find(tasks, (t) => t.uuid === instance.activeTask);
                                const step: string = _.find(wfDisplay.workflow.steps,
                                    (s) => s.tasks.indexOf(task) !== -1);
                                return _.assign(instance, { step, task, waiting: !participant.active });
                            }
                        );

                    const wSettings: WorkflowSettingsDto = _.find(this.workflows, { workflowUuid: wfDisplay.workflow.uuid });

                    // unique
                    if (wSettings.unique) {
                        wfDisplay.unique = true;

                        // no instance for user but instance for current workflow already started by other
                        if (instances.length === 0 && instancesForWf.length > 0) {
                            wfDisplay.disabled = true;
                        }
                    }

                    wfDisplay.instances = instances;
                });
                this.disabled = false;
            });
    }

    remove($event, index) {
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

    onClick(item) {
        this.activeDisplay = null;

        if (item.instances.length === 0) {
            // workflow (no instance)
            this.launched.emit({ workflow: item.workflow.uuid });
        } else {
            this.activeDisplay = item;
            // workflow (instance) up the scrollbar on click detail
            const popover = document.getElementsByClassName('popover-content');
            if (popover.length > 0) {
                document.getElementsByClassName('popover-content')[0].scrollTop = 0;
            }
        }
    }

    onBack() {
        if (!this.activeDisplay) {
            this.closed.emit();
        }
        this.activeDisplay = null;
    }

    onLaunchInstance(workflow, instance) {
        this.launched.emit({ workflow, instance: instance.uuid });
    }

    onLaunchWorkflow(workflow) {
        this.launched.emit({ workflow });
    }
}
