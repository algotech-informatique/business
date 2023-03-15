import { ElementRef, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Popover } from '../@components/popover/interfaces/popver.interface';
import { WorkflowDialogLoad, WorkflowDialogToast, WorkflowDialogAnswer, WorkflowDialogError,
    WorkflowDialogOptions } from './interfaces';

@Injectable()
export class WorkflowDialogService {
    _view: ElementRef;
    loadStack: WorkflowDialogLoad[] = [];
    toast: WorkflowDialogToast;
    answer: WorkflowDialogAnswer;
    error: WorkflowDialogError;
    options: WorkflowDialogOptions;

    dismissPopup = new Subject();
    showPopup = new Subject<Popover>();

    initialize(view) {
        this._view = view;
    }

    onSet() {
        const onSet = this.answer.onSet;
        this.answer = null;
        onSet();
    }

    onCancel() {
        const onCancel = this.answer.onCancel;
        this.answer = null;
        onCancel();
    }

    openOptions(element, options: WorkflowDialogOptions) {
        const viewRect = this._view.nativeElement.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        options.position = {
            top: (rect.y - viewRect.y) + 10,
            right: (viewRect.x + viewRect.width) - (rect.x + rect.width) + 10,
        };

        this.options = options;
    }

    dismiss() {
        this.loadStack = [];
        this.answer = null;
        this.toast = null;
        this.error = null;
        this.options = null;
        this.dismissPopup.next(null);
    }

    pushLoad(data: WorkflowDialogLoad) {
        this.loadStack.push(data);
        this.toast = { message: this.loadStack[this.loadStack.length - 1].message, blur: true };
    }

    popLoad(data: WorkflowDialogLoad) {
        const index = _.findIndex(this.loadStack, data);
        if (index === - 1) {
            return;
        }
        this.loadStack.splice(index, 1);
        if (this.loadStack.length === 0) {
            this.toast = null;
        } else {
            this.toast = { message: this.loadStack[this.loadStack.length - 1].message, blur: true };
        }
    }

    showToast(toast: WorkflowDialogToast) {
        this.toast = toast;
        setTimeout(() => {
            if (this.toast === toast) {
                this.toast = null;
            }
        }, toast.time ? toast.time : 2000);
    }
}

