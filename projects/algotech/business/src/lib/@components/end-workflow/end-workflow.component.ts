import { AfterViewInit, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TypeFinisherType } from '../../../../interpretor/src/dto/interpretor.finisher.dto';
import { WorkflowFinisherState } from '../../workflow-container/dto/workflow-finisher-state.type';

@Component({
    selector: 'at-end-workflow',
    templateUrl: './end-workflow.component.html',
    styleUrls: ['./end-workflow.component.scss']
})
export class EndWorkflowComponent implements AfterViewInit {

    @Input() openPlatform = true;
    @Input() state: WorkflowFinisherState = 'finished';
    @Input() message = '';
    @Input() type: TypeFinisherType = null;

    display = null;

    constructor(
        private translate: TranslateService,
        private router: Router,
        private ref: ChangeDetectorRef,
    ) { }

    backToVision() {
        this.router.navigate(['/'], { replaceUrl: true });
    }

    ngAfterViewInit() {
        const title = !this.type ? '' : `WORFKLOW.FINISH.TITLE.${this.type?.toUpperCase()}`;
        const message = `WORKFLOW.STATE.${this.state?.toUpperCase()}`;
        
        let className = this.type;
        let icon = '';

        switch (this.state) {
            case 'old':
                className = 'error';
                icon = 'fa-solid fa-box-archive';
                break;
            case 'wait':
                icon = 'fa-solid fa-clock';
                break;
            case 'finished': {
                switch (this.type) {
                    case 'warning':
                        icon = 'fa-solid fa-triangle-exclamation';
                        break;
                    case 'information':
                        icon = 'fa-solid fa-circle-question';
                        break;
                    case 'error':
                        icon = 'fa-solid fa-circle-xmark';
                        break;
                    default:
                        className = 'success';
                        icon = 'fa-solid fa-circle-check';
                        break;
                }
            }
        }

        this.display = {
            title: title && this.translate.instant(title) !== title ? this.translate.instant(title) : '',
            message: this.message ? this.message : (this.translate.instant(message) !== message ? this.translate.instant(message) : ''),
            icon,
            className
        }

        this.ref.detectChanges();
    }

}
