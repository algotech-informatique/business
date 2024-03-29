import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { TaskNotify } from '../../../../dto/task-notify.dto';
import { zip, of } from 'rxjs';
import { NotificationDto, NotificationActionDto, LangDto } from '@algotech-ce/core';
import { AuthService } from '@algotech-ce/angular';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import * as _ from 'lodash';
import { WorkflowUtilsService } from '../../../../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import { TaskNotificationError } from '../../../../container-error/container-error';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


@Component({
    template: `
    <div class="wf-padding">
        <i class="fa-solid fa-paper-plane"></i>
        <div class="content">
            <div class="to">
                <button>{{'SN-EMAIL-TO' | translate}}</button>
                <span>{{to}}</span>
            </div>

            <input
                type="text"
                [placeholder]="'TASK-MODEL-GUI.TASK.NOTIFICATION.TITLE' | translate"
                (change)="change()"
                [(ngModel)]="title">

            <textarea
                [placeholder]="'TASK-MODEL-GUI.TASK.NOTIFICATION.CONTENT' | translate"
                (change)="change()"
                [(ngModel)]="content">
            </textarea>
        </div>
    </div>
    `,
    styleUrls: ['./task-notification.component.scss']
})
export class TaskNotificationComponent implements TaskComponent, OnInit {
    _task: InterpretorTaskDto;
    @Input('task')

    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskNotify;
        zip(
            customData.title ? customData.title() : of(''),
            customData.content ? customData.content() : of(''),
            customData.destination ? customData.destination() : of('profil'),
            customData.profiles ? customData.profiles() : of([]),
            customData.profiles_viewer ? customData.profiles_viewer() : of([]),
            customData.groups_viewer ? customData.groups_viewer() : of([]),
            customData.users_viewer ? customData.users_viewer() : of([]),
            customData.channels ? customData.channels() : of(['web', 'mobile']),
        ).subscribe({
            next: (values: any[]) => {
                this.title = values[0];
                this.content = values[1];
                this.destination = values[2];
                this.profiles = values[3];
                this.profiles_viewer = values[4];
                this.groups_viewer = values[5];
                this.users_viewer = values[6];
                this.channels = values[7];

                this.to = _.uniq([...this.profiles, ...this.recipients_viewer]).reduce((result, elt: string) => {
                    if (result !== '') {
                        result = `${result}, `;
                    }
                    if (elt.includes('usr:')) {
                        result = `${result}${elt.replace('usr:', '')}`;
                    } else {
                        const grpKey = elt.replace('grp:', '');
                        const group = this._task.instance.context.groups.find((grp) => grp.key === grpKey);
                        result = `${result}${group ? group.name : grpKey}`;
                    }

                    return result;
                }, '');

                this.author = `${this.authSrv.localProfil.firstName} ${this.authSrv.localProfil.lastName}`;
                this.change();
            },
            error: (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-076', err, TaskNotificationError));
            }
        });
    }

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    author = '';
    title = '';
    content = '';
    destination = 'profil';
    profiles: string[] = [];
    profiles_viewer: string[] = [];
    groups_viewer: string[] = [];
    users_viewer: string[] = [];
    channels: string[] = [];
    to: string;

    constructor(
        private readonly authSrv: AuthService,
        private readonly workflowUtilsService: WorkflowUtilsService,
        private readonly taskUtils: TaskUtilsService
    ) { }

    get recipients_viewer() {
        switch (this.destination) {
            case 'profil':
                return this.profiles_viewer;
            case 'group':
                return this.groups_viewer.map((g) => `grp:${g}`);
            case 'user':
                return this.users_viewer.map((g) => `usr:${g}`);
        }
    }

    ngOnInit(): void {
        this.change();
    }

    change() {
        const transfers: InterpretorTransferTransitionDto[] = [];
        let notification: NotificationDto;

        if (this.recipients_viewer?.length !== 0) {
            const action: NotificationActionDto = {
                key: 'information'
            };
            notification = this._createNotification(this.recipients_viewer, action);

            transfers.push({
                saveOnApi: true,
                type: 'action',
                value: {
                    actionKey: 'notify',
                    value: notification
                }
            });
        }

        if (this.profiles?.length !== 0) {
            const action: NotificationActionDto = {
                key: 'workflow',
                object: this._task.instance.uuid
            };
            notification = this._createNotification(this.profiles, action);

            transfers.push({
                saveOnApi: true,
                requireInstance: true,
                type: 'action',
                value: {
                    actionKey: 'notify',
                    value: notification
                }
            });
        }

        if (notification) {
            transfers.push({
                saveOnApi: false,
                data: this._getTransitionData(this._task),
                type: 'sysobjects',
                value: notification
            });

            const validation: InterpretorValidateDto = {
                transitionKey: 'notify',
                transfers
            };
            this.partialValidate.emit({ validation, authorizationToNext: true });
        }
    }

    _createNotification(profiles: string[], action: NotificationActionDto): NotificationDto {

        const additional = _.find(this.workflowUtilsService.getActiveStep(this._task.instance).displayName,
            (name: LangDto) => name.lang === this.authSrv.localProfil.preferedLang)?.value;
        return {
            uuid: UUID.UUID(),
            title: this.title,
            content: this.content,
            additionalInformation: additional,
            author: this.author,
            date: moment().format(),
            icon: this._task.instance.workflowModel.iconName ?
                this._task.instance.workflowModel.iconName : 'fa-solid fa-diagram-project',
            state: {
                from: this.authSrv.localProfil.login,
                to: profiles,
                read: [],
            },
            action: action,
            channels: this.channels,
        };
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
