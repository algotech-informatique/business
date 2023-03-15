import { Component, OnInit, ViewChild } from '@angular/core';
import {
    AuthService, SettingsDataService, SmartObjectsService, DataService, ScheduleService, SmartFlowsService, LoaderService,
} from '@algotech/angular';
import { AlertController, Platform } from '@ionic/angular';
import { WorkflowSettingsDto, SmartObjectDto, ScheduleDto, WorkflowModelDto } from '@algotech/core';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { InterpretorFormulaParser, ThemeEngloberService, ToastService,
    WorkflowLaunchService, WorkflowSyncComponent } from '../../../projects/algotech/business/public_api';
import * as d3 from 'd3';
import { WorkflowState } from '../../../projects/algotech/business/src/lib/workflow-container/dto/workflow-state.enum';

const wfModelKey = 'testliste';
const wfi = '8fcd7528-36f4-038b-1a80-8117de1f2a25';
const wfUuid = '78c0bb0e-5471-98dc-dccb-433598a5f3ed';

const profil1 = { uuid: '5138126f-4252-46f3-8a1d-03369b671d4f', group: 'sadmin' };
const profil2 = { uuid: '0f865457-f99b-10e6-56d3-6b9542189be5', group: 'sadmin' };
const profil3 = { uuid: 'b860e1d6-4538-3993-ceed-5865de5cdf5c', group: 'viewer' };
const platform = 'mobile';
const byModel = true;
const launchDirectly = false;

@Component({
    selector: 'app-player',
    styleUrls: ['./player.page.scss'],
    templateUrl: './player.page.html',
})
export class PlayerPage implements OnInit {
    @ViewChild(WorkflowSyncComponent) sync: WorkflowSyncComponent;

    synchTitle = 'Synchronization';

    slideOpts = {
        initialSlide: 0,
        speed: 400,
    };

    public _open = true;
    public _byModel = byModel;
    public loading = true;
    myWorkflow: WorkflowModelDto;
    calculatedDate;
    dateFuntion =  '';
    p1 = '';
    p2 = '';
    p3 = '';
    private _workFlowModelKey = null;
    private _workFlowInstance = null;

    private _inputs = [
        {key: 'smart-object-selected', value: '0147ae3e-3e81-22fd-e9a8-2c1dfa88481e' }
    ];

    private _settings: WorkflowSettingsDto = {
        workflowUuid: wfUuid,
        securityGroup: [{
            profil: profil1.uuid,
            group: profil1.group,
            login: '',
        }, {
            profil: profil2.uuid,
            group: profil2.group,
            login: '',
        }, {
            profil: profil3.uuid,
            group: profil3.group,
            login: '',
        }],
        savingMode: 'END',
        context: '',
        filters: [],
        platforms: ['mobile'],
        unique: true
    };

    constructor(
        public scheduleService: ScheduleService,
        public authService: AuthService,
        private dataService: DataService,
        private alertController: AlertController,
        private loader: LoaderService,
        public settingsDataService: SettingsDataService,
        private workflowLaunchService: WorkflowLaunchService,
        private soServices: SmartObjectsService,
        private translateService: TranslateService,
        private toastService: ToastService,
        private themeEngloberService: ThemeEngloberService,
    ) {
    }

    ngOnInit() {
        // this.storage.clear().then(() => {
        this.dataService.mobile = true;
        this.dataService.networkService.offline = false;

        this.translateService.setDefaultLang('fr-FR');
        this.translateService.use('fr-FR');

        this.loader.Initialize()
            .subscribe(() => {
                this.themeEngloberService.theme.next(this.settingsDataService.settings.theme);
                this.loading = false;
                this._workFlowInstance = wfi;
                this._workFlowModelKey = wfModelKey;
                this.myWorkflow = this.settingsDataService.workflows.find((wf) => wf.key === this._workFlowModelKey);
                if (launchDirectly) {
                    this.launchPopover();
                }
            });
    }

    onRetry() {
        this.myWorkflow = _.cloneDeep(this.myWorkflow);
    }

    async onFinished(state: WorkflowState) {
        const message = state === WorkflowState.Await ? 'Workflow en attente' : 'Workflow terminé';
        switch (state) {
            case WorkflowState.Await:
                break;
            case WorkflowState.Finished:
                break;
        }

        this._open = false;

        const alert = await this.alertController.create({
            message: message,
            buttons: ['OK']
        });

        await alert.present();
    }

    openSchedule(e) {
        this.scheduleService.get(_.find(this._inputs, (i) => i.key === 'schedule').value).pipe(
            catchError(() => of(null))
        ).subscribe((res: ScheduleDto) => {
            if (!res) {
                this.toastService.fail('Aucun Schedule Trouvé');
            } else {
                this.workflowLaunchService.launchSchedules(e, res, false);
            }
        });
    }

    openContext($event, context) {
        let beforeLaunch$ = of({});
        for (const input of this._inputs) {
            this.workflowLaunchService.setSourceValue(input.key, input.value);
            if (input.key === 'smart-object-selected' || input.key === 'smart-objects-selected') {
                beforeLaunch$ = this.soServices.get(Array.isArray(input.value) ? input.value[0] : input.value).pipe(
                    tap((so: SmartObjectDto) => {
                        this.workflowLaunchService.setAdditional('smart-object', so);
                        this.workflowLaunchService.setAdditional('smart-model',
                            _.find(this.settingsDataService.smartmodels, (sm) => sm.key === so.modelKey));
                    })
                );
            }
        }

        beforeLaunch$.subscribe(() => {
            this.workflowLaunchService.launchEvents($event, context, platform, false, () => {
                this.sync._refreshInstances();
            });
        });
    }

    public launchPopover() {
        this.workflowLaunchService.launch({
            inputs: this._inputs,
            settings: this._settings,
            workflowModelKey: byModel ? this._workFlowModelKey : null,
            workflowInstance: !byModel ? this._workFlowInstance : null,
        }, () => {
            this.sync._refreshInstances();
        });
    }

    executeCustomFormula(){
        const formula = `${this.dateFuntion}(${(this.p1 != '') ?
            `${this.p1}` : ''}${(this.p2 != '') ? `,${this.p2}` :
            ''}${(this.p3 != '') ? `,${this.p3}` : ''})`;
        const parser = new InterpretorFormulaParser();
        this.calculatedDate = '';
        if (parser.tryParseFormula(formula, [this.p1, this.p2, this.p3])) {
            const r = parser.executeFormula(); 
            this.calculatedDate = (r.error) ? r.error : r.result;
        } else {
            this.calculatedDate = 'invalid formula';
        }
    }
}
