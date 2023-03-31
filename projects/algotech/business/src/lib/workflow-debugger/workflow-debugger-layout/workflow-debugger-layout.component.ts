import {
    Component, Input, OnChanges, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges, Output, EventEmitter,
    OnDestroy,
    Inject
} from '@angular/core';
import * as _ from 'lodash';
import { AuthService, EnvService } from '@algotech-ce/angular';
import { GenericListDto, WorkflowModelDto, TagListDto, SmartModelDto, SettingsDto, GroupDto, ApplicationModelDto } from '@algotech-ce/core';
import { WorkflowSubjectService } from '../../workflow-interpretor/workflow-subject/workflow-subject.service';
import { WorkflowDebuggerService } from '../workflow-debugger.service';
import { APP_BASE_HREF } from '@angular/common';

@Component({
    selector: 'at-workflow-debugger-layout',
    templateUrl: './workflow-debugger-layout.component.html',
    styleUrls: ['./workflow-debugger-layout.component.scss'],
})

export class WorkflowDebuggerLayoutComponent implements OnChanges, OnDestroy {
    @ViewChild('iframe', { static: false }) iframe: ElementRef;

    @Input()
    workflow: WorkflowModelDto;

    @Input() link = '/debugger';
    @Input() glists: GenericListDto[];
    @Input() groups: GroupDto[];
    @Input() settings: SettingsDto;
    @Input() smartmodels: SmartModelDto[];
    @Input() tags: TagListDto[];
    @Input() apps: ApplicationModelDto[];

    @Output()
    retry = new EventEmitter();

    @Output()
    saveDatas = new EventEmitter();

    frameInit = false;
    environment: any;

    platform = 'desktop';

    mobileImage: string;

    handleActionEvent = (e) => {
        this.workflowSubjectService.next(e.detail);
    }

    handleStartEvent = (e) => {
        this.saveDatas.emit(this.workflowDebuggerService.saveDatas(e.detail));
    }

    handleReadyEvent = (e) => {
        this.loadFrame();
        this.frameInit = true;
    }

    constructor(
        private ref: ChangeDetectorRef,
        private workflowDebuggerService: WorkflowDebuggerService,
        private authService: AuthService,
        private envService: EnvService,
        private workflowSubjectService: WorkflowSubjectService,
        @Inject(APP_BASE_HREF) public baseHref: string,
    ) {

        this.envService.environment.subscribe((environment) => {
            this.environment = environment;
        });
        this.mobileImage = this.baseHref + 'assets/images/mobile.png';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.workflow) {
            this.loadWorkflow();
        }
    }

    ngOnDestroy() {
        window.document.removeEventListener('ready', this.handleReadyEvent, true);
        window.document.removeEventListener('action', this.handleActionEvent, true);
        window.document.removeEventListener('start', this.handleStartEvent, true);
    }

    changePlatform(platform) {
        this.platform = platform;
    }

    onRetry() {
        this.retry.emit();
    }

    loadFrame() {
        this.ref.detectChanges();
        if (!this.iframe || !(<HTMLIFrameElement>this.iframe.nativeElement).contentDocument) {
            return;
        }

        const data = {
            environment: this.environment,
            localProfil: this.authService.localProfil,
            glists: this.glists,
            groups: this.groups,
            settings: this.settings,
            smartmodels: this.smartmodels,
            tags: this.tags,
            workflow: this.workflow,
            inputs: this.workflowDebuggerService.loadData(this.workflow),
            apps: this.apps,
        };

        const event = new CustomEvent('load', { detail: data });
        (<HTMLIFrameElement>this.iframe.nativeElement).contentDocument.dispatchEvent(event);
    }

    loadWorkflow() {
        if (!this.frameInit) {
            // first loading
            window.document.removeEventListener('ready', this.handleReadyEvent, true);
            window.document.addEventListener('ready', this.handleReadyEvent, true);
        } else {
            this.loadFrame();
        }

        // receive
        window.document.removeEventListener('action', this.handleActionEvent, true);
        window.document.addEventListener('action', this.handleActionEvent, true);

        // receive
        window.document.removeEventListener('start', this.handleStartEvent, true);
        window.document.addEventListener('start', this.handleStartEvent, true);
    }
}
