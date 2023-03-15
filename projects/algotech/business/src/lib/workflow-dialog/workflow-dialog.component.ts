import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { WorkflowDialogService } from './workflow-dialog.service';
import * as _ from 'lodash';

@Component({
    selector: 'at-workfow-dialog',
    template: `
    <div class="background" #content [ngClass]="{
        'active': workflowDialog.loadStack.length > 0 || workflowDialog.answer || workflowDialog.toast?.blur
            || workflowDialog.error || workflowDialog.options,
        'dark': workflowDialog.answer || workflowDialog.error
    }"></div>

    <div class="alert" (click)="closeOptions()">
        <!-- spinner !-->
        <spinner *ngIf="!workflowDialog.answer && !workflowDialog.error &&
            workflowDialog.loadStack.length > 0"></spinner>

        <!-- toast !-->
        <div class="toast" *ngIf="workflowDialog.toast?.message">
            <div class="message" [ngClass]="{active: workflowDialog.toast}">
                <span>
                    {{workflowDialog.toast.message | translate}}
                </span>
            </div>
        </div>

        <!-- options !-->
        <div class="container" *ngIf="workflowDialog.options">
            <div class="options"
                [ngStyle]="{
                    'top': workflowDialog.options.position.top + 'px',
                    'right': workflowDialog.options.position.right + 'px'
                }"
                (click)="$event.stopPropagation()">
                <div *ngFor="let action of workflowDialog.options.actions" class="action" [ngClass]="{
                        'disabled': action.disabled
                    }" (click)="clickAction(action)">
                    <div class="action-content">
                        <i [class]="action.icon" [style.color]="action.color ? action.color : 'inherit'"></i>
                        <span>{{action.caption}}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- answer !-->
        <div class="container" *ngIf="workflowDialog.answer">
            <div [class]="'modal show-alert ' + workflowDialog.answer.className">
                <div class="header-content" *ngIf="workflowDialog.answer.icon" >
                    <div class="header">
                        <i [class]="'icon ' +workflowDialog.answer.icon"></i>
                    </div>
                </div>
                <div class="content">
                    <span class="title">{{workflowDialog.answer.title}}</span>
                    <span class="message">{{workflowDialog.answer.message}}</span>
                </div>
                <div class="buttons">
                    <button (click)="workflowDialog.onSet()">{{'DIALOGBOX.OK' | translate}}</button>
                    <button *ngIf="workflowDialog.answer.onCancel"
                        (click)="workflowDialog.onCancel()">{{'DIALOGBOX.CANCEL' | translate}}</button>
                </div>
            </div>
        </div>

        <!-- error !-->
        <div class="container" *ngIf="workflowDialog.error">
            <div class="modal">
                <div class="error">
                    <span class="sad"><i class="fa-solid fa-face-frown"></i></span>
                    <span class="oups">Oups !</span>
                    <span class="message">{{'WORKFLOW-ERROR-TITLE' | translate}}</span>
                    <span class="detail">{{'WORKFLOW-ERROR-DETAIL' | translate}}</span>
                    <span class="error">{{workflowDialog.error.message}}</span>
                    <span class="button">
                        <button class="close"  *ngIf="workflowDialog.error.closable"
                            (click)="closeErrors()">{{'DIALOGBOX.CLOSE' | translate}}</button>
                    </span>
                </div>
            </div>
        </div>

    </div>
        `,
    styleUrls: ['./workflow-dialog.component.scss'],
})

export class WorkflowDialogComponent implements AfterViewInit {
    @ViewChild('content') content: ElementRef;

    popupBackcolor = '';

    constructor(
        public workflowDialog: WorkflowDialogService) { }
    // error, confirmation, spinner

    ngAfterViewInit() {
        this.workflowDialog.initialize(this.content);
    }

    clickAction(action) {
        action.onClick();
        this.closeOptions();
    }

    closeOptions() {
        this.workflowDialog.options = null;
    }

    closeErrors() {
        this.workflowDialog.error = null;
    }
}

