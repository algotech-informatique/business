import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowInstanceDto, WorkflowModelDto, PairDto, WorkflowSettingsDto, WorkflowInstanceContextDto } from '@algotech/core';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, map, tap, finalize, first, mergeMap } from 'rxjs/operators';
import { PaginateAction } from './dto/paginate-action';
import { WorkflowUtilsService } from '../workflow-interpretor/workflow-utils/workflow-utils.service';
import * as _ from 'lodash';
import { TaskCustomService } from './task-player/task-custom/task-custom.service';
import { InterpretorTypeJump, InterpretorSubjectDto, InterpretorFinisherDto } from '../../../interpretor/src/dto';
import { WorkflowSubjectService } from '../workflow-interpretor/workflow-subject/workflow-subject.service';
import { InterpretorTaskDto } from '../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../interpretor/src/dto';
import { WorkflowInterpretorService } from '../workflow-interpretor/workflow-interpretor.service';
import { InterpretorJumpDto } from '../../../interpretor/src/dto';
import { DataService, AuthService, SettingsDataService } from '@algotech/angular';
import {
    WorkflowErrorUnauthorizedProfil,
    WorkflowErrorOldInstance
} from '../../../interpretor/src/error/interpretor-error';
import { WorkflowDialogService } from '../workflow-dialog/workflow-dialog.service';
import { WorkflowDialogLoad, WorkflowDialogToast } from '../workflow-dialog/interfaces';
import { ToastService } from '../@services/toast.service';
import { TypeFinisherType } from '../../../interpretor/src/dto/interpretor.finisher.dto';
import { WorkflowFinisherState } from './dto/workflow-finisher-state.type';
import { WorkflowDataService } from '../workflow-interpretor/workflow-data/workflow-data.service';
import { WorkflowSaveService } from '../workflow-interpretor/workflow-save/workflow-save.service';

@Component({
    selector: 'at-workflow-container',
    styleUrls: ['./workflow-container.style.scss'],
    templateUrl: './workflow-container.component.html'
})

export class WorkflowContainerComponent implements OnInit, OnDestroy {
    @Input() workFlowModelKey: string;
    @Input() workFlowInstance: string;
    @Input() inputs: PairDto[] = null;
    @Input() openPlatform = false;
    @Input() settings: WorkflowSettingsDto = null;
    @Input() metrics = false;

    @Output() closed = new EventEmitter();
    @Output() finished = new EventEmitter();

    readonly _onDestroy = new Subject<void>();
    _currentTask: InterpretorTaskDto;
    _currentWorkflow: WorkflowInstanceDto;
    _currentWorkflowModel: WorkflowModelDto;
    _partialValidate: InterpretorValidateDto = null;
    _validate: InterpretorValidateDto = null;
    _authorizationToNext = false;
    _finisherDisplay: {
        state: WorkflowFinisherState;
        message?: string;
        type?: TypeFinisherType;
    } = null;
    showNext = false;
    subscriber;

    history = false;
    popState;

    constructor(
        public workflowDialog: WorkflowDialogService,
        private ref: ChangeDetectorRef,
        private dataService: DataService,
        private translate: TranslateService,
        private taskCustomService: TaskCustomService,
        private authService: AuthService,
        private settingsDataService: SettingsDataService,
        private workflowInterpretor: WorkflowInterpretorService,
        private workflowUtils: WorkflowUtilsService,
        private workflowSubject: WorkflowSubjectService,
        private workflowData: WorkflowDataService,
        private workflowSave: WorkflowSaveService,
        private globalToast: ToastService,
    ) {
    }

    ngOnInit() {
        this.subscriber = this.workflowSubject.subject.subscribe(
            (res: InterpretorSubjectDto) => {
                if (!res.success && !this.dataService.mobile) {
                    this.handleError(new Error(`fail ${res.action} : ${res.error.message}`));
                }
            }
        );
        this.loadData();

        if (this.history) {
            window.history.pushState({}, '');
            this.popState = () => {
                window.history.pushState({}, '');

                if (this._currentWorkflow && this.workflowUtils.canPrevious(this._currentWorkflow)) {
                    this.previousTask(null);
                } else {
                    this.closed.emit();
                }
            };
            window.addEventListener('popstate', this.popState);
        }
    }

    loadData() {
        this.authService.localProfil.user.preferedLang = this.translate.currentLang;

        const context: WorkflowInstanceContextDto = {
            user: this.authService.localProfil.user,
            jwt: this.authService.localProfil.key,
            apps: this.settingsDataService.apps,
            smartmodels: this.settingsDataService.smartmodels,
            glists: this.settingsDataService.glists,
            groups: this.settingsDataService.groups,
            settings: this.settingsDataService.settings,
            metrics: this.metrics ? [] : null,
            custom: {
                indexes: {}
            },
        };

        const loader: WorkflowDialogLoad = { message: this.translate.instant('WORKFLOW.PREPARING') };
        if (this.workFlowModelKey && this.inputs && this.settings) {
            this.workflowDialog.pushLoad(loader);
            setTimeout(() => {
                this.workflowInterpretor.startWorkflow(this.workFlowModelKey, this.settings, context, this.inputs).pipe(
                    tap(() => {
                        this.workflowDialog.popLoad(loader);
                    }),
                    takeUntil(this._onDestroy)
                ).subscribe((task: InterpretorTaskDto) => {
                    this._currentWorkflow = task.instance;
                    this._currentWorkflowModel = this._currentWorkflow.workflowModel;
                    this._moveNextTask(of(task));

                }, (err) => {
                    this.workflowDialog.popLoad(loader);
                    this.handleError(err, true);
                });
            }, 0);
        } else if (this.workFlowInstance) {
            this.workflowDialog.pushLoad(loader);
            setTimeout(() => {
                this.workflowInterpretor.runInstance(this.workFlowInstance, context).pipe(
                    tap(() => {
                        this.workflowDialog.popLoad(loader);
                    }),
                    takeUntil(this._onDestroy)
                ).subscribe((task: InterpretorTaskDto) => {
                    this._currentWorkflow = task.instance;
                    this._currentWorkflowModel = this._currentWorkflow.workflowModel;
                    this._moveNextTask(of(task));

                }, (err) => {
                    this.workflowDialog.popLoad(loader);
                    this.handleError(err, true);
                });
            }, 0);
        }
    }

    partialValidate(event: { validation: InterpretorValidateDto; authorizationToNext: boolean; }) {
        this._partialValidate = event.validation;
        this._validate = this._partialValidate;
        this._authorizationToNext = event.authorizationToNext;
        this.showNext = this._computeshowNext();

        this.ref.detectChanges();
    }

    validate(validateDto: InterpretorValidateDto) {
        this._validate = validateDto;
        const checkReverse = this.workflowUtils.mustBeReversed(this._currentWorkflow, validateDto) &&
            this.workflowUtils.mustBeReversedOperations(this._currentWorkflow);
        if (checkReverse) {
            this.presentAlertConfirm({
                title: this.translate.instant('WORKFLOW.CHANGE.VALIDATE-TITLE'),
                message: this.translate.instant('WORKFLOW.CHANGE.VALIDATE-MESSAGE'),
                validate: validateDto
            });
        } else {
            this._processTaskValidation(validateDto);
        }
    }

    private _processTaskValidation(validateDto: InterpretorValidateDto): void {
        this._moveNextTask(this.workflowInterpretor.taskValidate(this._currentWorkflow, validateDto));
    }

    private _processTaskJump(jump: InterpretorJumpDto): void {
        this.workflowInterpretor
            .taskJump(this._currentWorkflow, jump)
            .subscribe(
                (task: InterpretorTaskDto) => {
                    this._partialValidate = null;
                    this.showNext = this._computeshowNext();

                    return this._currentTask = task;
                },
                (err) => {
                    this.handleError(err);
                }
            );
    }

    private _moveNextTask(obsNextTask: Observable<InterpretorTaskDto | InterpretorFinisherDto>): void {

        const loader: WorkflowDialogLoad = { message: '' };
        this.workflowDialog.pushLoad(loader);
        setTimeout(() => {
            obsNextTask.pipe(
                mergeMap((nextTask: InterpretorTaskDto | InterpretorFinisherDto) => {
                    if (nextTask instanceof InterpretorFinisherDto) {
                        return of({
                            service: null,
                            task: nextTask
                        });
                    }

                    // try to execute task process (alert, geolocation, auto photo, ...)
                    return this.taskCustomService.execute(nextTask, this._currentWorkflow).pipe(
                        map((service: InterpretorValidateDto | InterpretorJumpDto) => {
                            this._partialValidate = null;
                            this.showNext = this._computeshowNext(); // probably the best place to compute next authorization
                            return {
                                service,
                                task: nextTask
                            };
                        })
                    );
                }),
                first(), // force to complete
                finalize(() => {
                    this.workflowDialog.popLoad(loader);
                })
            ).subscribe((result: {
                service: InterpretorValidateDto | InterpretorJumpDto;
                task: InterpretorTaskDto | InterpretorFinisherDto;
            }) => {
                if (result.service) { // Case of non UI task (validate)
                    if (result.service instanceof InterpretorJumpDto) {
                        this._processTaskJump(result.service);
                    } else {
                        this.validate(result.service);
                    }
                } else if (result.task instanceof InterpretorFinisherDto) {
                    this.dismiss('finished', result.task);
                } else { // Case of UI task
                    this._currentTask = result.task;
                }
            }, (err) => this.handleError(err, true));
        }, 0);
    }

    public handleError(err, emitState = false) {
        if (emitState) {
            if (err instanceof WorkflowErrorUnauthorizedProfil) {
                this.dismiss('wait');
                return;
            }

            if (err instanceof WorkflowErrorOldInstance) {
                this.dismiss('old');
                return;
            }
        }

        this.workflowDialog.dismiss();
        this.workflowDialog.error = {
            message: this.translateWorkflowDialogError(err.message),
            closable: this._currentWorkflow && this._currentWorkflow.state !== 'finished'
        };
        throw err;
    }

    private translateWorkflowDialogError(message: string): string {
        let msgTranslate = message;
        const keys: string[] = _.uniq(this.extractBracketedStrings(message));
        keys.forEach((key: string) => {
            msgTranslate = msgTranslate.replace(new RegExp(key, 'g'), this.translate.instant(key.split('{{')[1].split('}}')[0]));
        });

        return msgTranslate;
    }

    private extractBracketedStrings(str: string): string[] {
        const matches = str.match(/{{[^}]+}}/g);
        return matches ? matches : [];
    }

    private showFinisherDisplay(finisher: InterpretorFinisherDto) {
        const message = finisher.message ? finisher.message : this.translate.instant(`WORKFLOW.STATE.FINISHED`);
        const timeout = finisher.timeout ? finisher.timeout : 1500;

        this.workflowDialog.dismiss();

        switch (finisher.displayMode) {
            case 'nothing': {
                this.closed.emit();
            }
                break;
            case 'toast': {
                this.closed.emit();
                this.globalToast.presentToast(message, timeout);
            }
                break;
            default: {
                if (finisher.timeout > 0) {
                    setTimeout(() => {
                        this.closed.emit();
                    }, timeout);
                }
            }
                break;
        }
    }

    private dismiss(state: WorkflowFinisherState, finisher?: InterpretorFinisherDto) {
        const modal = this.history;
        const popup = finisher?.displayMode === 'popup';
        const debug = this.workflowUtils.isReadonly(this._currentWorkflow);

        this.finished.emit();
        this.popHistory();

        this._currentTask = null;

        if (popup || !modal) {
            this._finisherDisplay = { state, message: finisher?.message, type: finisher?.type };
        }

        // modal
        if (!modal) {
            this.closed.emit();
            return;
        }

        // default
        if (!finisher) {
            this._finisherDisplay = { state };
            setTimeout(() => {
                this.closed.emit();
            }, 3000);
            return;
        }

        // trigger
        switch (finisher.outputTrigger) {
            case 'end-wf': {
                this.showFinisherDisplay(finisher);
                return;
            }
            case 'end-op': {
                if (debug || this.dataService.networkService.offline || !this.workflowSave.isSaving) {
                    this.showFinisherDisplay(finisher);
                    return;
                }
                const loader: WorkflowDialogLoad = { message: this.translate.instant('WORKFLOW.FINISH') };
                this.workflowDialog.pushLoad(loader);

                const subscriber = this.workflowSubject.subject.subscribe((res: InterpretorSubjectDto) => {
                    if (res.success) {
                        if (res.action === 'operations') {
                            this.showFinisherDisplay(finisher);
                            subscriber.unsubscribe();
                        }
                    }
                });
            }
                break;
        }
    }

    private _computeshowNext(): boolean {
        if (this._partialValidate) {
            return this._authorizationToNext;
        } else {
            return this.workflowUtils.canNext(this._currentWorkflow);
        }
    }

    onStepJump(uuid) {
        this._processTaskJump({ direction: InterpretorTypeJump.Jump, uuid });
    }

    previousTask(action: PaginateAction) {
        this._processTaskJump({ direction: InterpretorTypeJump.Previous });
    }

    nextTask() {
        if (this._partialValidate) {
            this.validate(this._partialValidate);
        } else {
            this._processTaskJump({ direction: InterpretorTypeJump.Next });
        }
    }
    async showToast(toast: WorkflowDialogToast) {
        this.workflowDialog.showToast(toast);
    }

    presentAlertConfirm(input: { title: string; message: string; validate: InterpretorValidateDto; }) {
        this.workflowDialog.answer = {
            className: '',
            title: input.title,
            message: input.message,
            onSet: () => {
                this._processTaskValidation(this._validate);
            },
            onCancel: () => {
            },
        };
    }

    popHistory() {
        if (this.history) {
            this.history = false;
            window.history.back();
            this.popState = window.removeEventListener('popstate', this.popState);
        }
    }

    ngOnDestroy(): void {
        if (!this.workflowUtils.isFinished(this._currentWorkflow) && !this.workflowUtils.isReadonly(this._currentWorkflow)) {
            this.workflowData.saveInstance(this._currentWorkflow, true).subscribe();
        }

        this.workflowDialog.dismiss();
        if (this.subscriber) {
            this.subscriber.unsubscribe();
            this.subscriber = null;
        }
        this.popHistory();
        this._onDestroy.next();
    }

    onClose() {
        this.closed.emit();
    }
}

