import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService, SmartLinkService, SettingsDataService, DataService, LoaderService } from '@algotech/angular';
import { PairDto, WorkflowModelDto, WorkflowProfilModelDto, WorkflowSettingsDto,
    WorkflowSettingsSecurityGroupsDto } from '@algotech/core';
import { mergeMap, map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { UUID } from 'angular2-uuid';
import { WorkflowSubjectService } from '../workflow-interpretor/workflow-subject/workflow-subject.service';
import { InterpretorSubjectDto } from '../../../interpretor/src';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowLaunchService } from '../workflow-launcher/workflow-layout.lancher.service';
import { SysUtilsService } from '../workflow-interpretor/@utils/sys-utils.service';
import { WorkflowDialogService } from '../workflow-dialog/workflow-dialog.service';
import { WorkflowDialogLoad } from '../workflow-dialog/interfaces';

@Component({
    selector: 'at-smart-link',
    styleUrls: ['./smartlink.component.scss'],
    templateUrl: './smartlink.component.html'
})

export class SmartLinkComponent implements AfterViewInit, OnDestroy {
    workflow: WorkflowModelDto;
    inputs: PairDto[];
    settings: WorkflowSettingsDto;

    state: 'loading' | 'signinFailed' | 'workflowUnknown' | 'saved' = null;
    login: string;
    password: string;

    subscription;

    constructor(
        public authService: AuthService,
        private dataService: DataService,
        private loader: LoaderService,
        private settingsDataService: SettingsDataService,
        private router: Router,
        private route: ActivatedRoute,
        private smartlinkService: SmartLinkService,
        private translate: TranslateService,
        private sysUtilsService: SysUtilsService,
        private workflowLaunchService: WorkflowLaunchService,
        private workflowSubject: WorkflowSubjectService,
        private ref: ChangeDetectorRef,
        private workflowDialog: WorkflowDialogService) { }

    ngAfterViewInit(): void {
        if (this.authService.isAuthenticated) {
            this.runSmartLink().subscribe();
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    backToVision() {
        this.router.navigate(['/'], { replaceUrl: true });
    }

    async onFinished() {
        const loader: WorkflowDialogLoad = { message: this.translate.instant('WORKFLOW.FINISH') };
        this.workflowDialog.pushLoad(loader);

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.subscription = this.workflowSubject.subject.subscribe((res: InterpretorSubjectDto) => {
            if (res.action === 'operations') {
                this.workflowDialog.popLoad(loader);
                this.state = 'saved';
            }
        });

    }

    private runSmartLink() {
        return this.route.paramMap.pipe(
            mergeMap((params: ParamMap) => {
                const token: string = params.get('token');
                return this.loader.Initialize().pipe(map(() => token));
            }),
            tap((token: string) => {
                this.state = null;
                if (token) {
                    const embeddedLink = this.smartlinkService._decodeB64(token);
                    this.workflow = this.settingsDataService.workflows.find((w) => w.key === embeddedLink.key);
                    if (this.workflow) {
                        this.state = null;
                        this.inputs = _.uniqBy([...embeddedLink.sources, ...this.workflowLaunchService.computeParameters()], 'key');
                        this.settings = this.createSettings(this.workflow, embeddedLink.backup, embeddedLink.unique);
                    } else {
                        this.state = 'workflowUnknown';
                        this.authService.logout();
                    }
                }
            })
        );
    }

    private createSettings(workflow: WorkflowModelDto, savingMode: string, unique: boolean) {
        const settings: WorkflowSettingsDto = {
            uuid: UUID.UUID(),
            context: 'workflow',
            platforms: ['mobile', 'desktop'],
            filters: [],
            savingMode,
            securityGroup: _.map(workflow.profiles, (p: WorkflowProfilModelDto) => {
                const sGroup: WorkflowSettingsSecurityGroupsDto = {
                    profil: p.uuid,
                    group: '',
                    login: this.authService.localProfil.login,
                };
                return sGroup;
            }),
            workflowUuid: workflow.uuid,
            unique,
        };

        return settings;
    }
}
