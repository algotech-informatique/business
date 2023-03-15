import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { TaskReviewDto } from '../../../../dto/task-review.dto';
import { NotificationDto, SysFile } from '@algotech/core';
import { zip, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { TranslateService } from '@ngx-translate/core';
import { TaskReviewError } from '../../../../container-error/container-error';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    template: `
    <div class="container">
        <div class="content">
            <div class="notification">
                <span class="caption">
                    {{'TASK-MODEL-GUI.TASK.NOTIFICATION' | translate}}
                </span>
                <div class="message">
                    <div class="title">{{title}}</div>
                    <div class="content">{{content}}</div>
                    <div *ngIf="modifyComment" class="comment">
                        <i class="fa-solid fa-comment"></i>
                        <textarea
                            [placeholder]="'TASK-MODEL-GUI.TASK.REVIEW.COMMENT'  | translate"
                            [(ngModel)]="validationComment">
                        </textarea>
                    </div>
                </div>
            </div>

            <div class="files">
                <span class="caption">
                    {{'TASK-MODEL-GUI.TASK.REVIEW.LINKED-FILES' | translate}}
                </span>
                <div class="files-content">
                    <at-file-component *ngFor="let file of linkedFiles"
                        [file]="file"
                        [clickable]="true"
                        [framed]="true"
                        (clickFile)="_openFile(file)">
                    </at-file-component>
                </div>
            </div>
        </div>

        <at-task-transitions class="transitions"
            [transitions]="_task.transitions" (validate)="_validate($event)"></at-task-transitions>
    </div>
  `,
    styleUrls: ['./task-review.component.scss']
})

export class TaskReviewComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    linkedFiles: SysFile[];
    notification: NotificationDto;
    modifyComment: boolean;

    files = false;
    title = '';
    content = '';
    comment = '';
    validationComment = '';

    constructor(
        private fileService: FilesService,
        private translate: TranslateService,
        private taskUtils: TaskUtilsService
    ) {
    }

    _task: InterpretorTaskDto;

    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        // In
        const customData = this._task.custom as TaskReviewDto;
        zip(
            customData.comment(),
            customData.linkedFiles ? customData.linkedFiles() : of([]),
            customData.notification()
        ).subscribe((values: any) => {
            this.modifyComment = values[0];
            this.linkedFiles = _.isArray(values[1]) ? values[1] : [values[1]];
            this.notification = values[2];

            this.title = this.notification.title;
            this.content = this.notification.content;
            this.validationComment = '';
        }, (err) => {
            this.handleError.emit(this.taskUtils.handleError('ERR-077', err, TaskReviewError));
        });
    }

    _validate(transitionKey: string) {
        // Out
        const validation: InterpretorValidateDto = this._computeValidation(transitionKey);
        this.validate.emit(validation);
    }

    _computeValidation(transitionKey: string): InterpretorValidateDto {
        if (this.validationComment) {
            const reviewComment = this.translate.instant('TASK-MODEL-GUI.TASK.REVIEW.REVIEW-COMMENT');
            this.content = this.content + '\n' + reviewComment + ': ' + this.validationComment;
            this.notification.content = this.content;
        }
        const transfers: InterpretorTransferTransitionDto[] = [];
        const findNotification = this._task.instance.data.find(
            (d) => d.value && d.value.uuid && d.value.uuid === this.notification.uuid
        );
        if (findNotification) {
            transfers.push({
                saveOnApi: false,
                type: 'sysobjects',
                value: this.notification,
                data: {
                    key: findNotification.key,
                    type: findNotification.type
                }
            });
        }

        const validation: InterpretorValidateDto = {
            transitionKey,
            transfers
        };
        return validation;
    }

    _openFile(file: SysFile) {
        this.fileService.downloadDocument(file, false, true).pipe(
            tap((asset: FileAssetDto) => {
                this.fileService.openDocument(asset.file, asset.infoFile.name);
            })
        ).subscribe();
    }
}
