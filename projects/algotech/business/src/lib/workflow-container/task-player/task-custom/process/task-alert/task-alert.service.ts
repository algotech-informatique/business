import { TaskService } from '../../task-service.interface';
import { zip, Observable, of, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, mergeMap } from 'rxjs/operators';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TaskAlertDto } from '../../../../dto/task-alert.dto';

import { TaskAlertError } from '../../../../container-error/container-error';
import { WorkflowDialogService } from '../../../../../workflow-dialog/workflow-dialog.service';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Injectable()
export class TaskAlertService implements TaskService {

    constructor(
        private workflowDialog: WorkflowDialogService,
        private taskUtils: TaskUtilsService) {
    }

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskAlertDto);
        return zip(
            customData.alertTitle ? customData.alertTitle() : of(''),
            customData.alertMessage(),
            customData.alertType ? customData.alertType() : of('information'),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-087', err, TaskAlertError);
            }),
            mergeMap((values: any[]) => {
                return this.openAlert(values[0], values[1], values[2]);
            })
        );
    }

    openAlert(alertTitle: string, alertMessage: string, alertType: 'information' | 'warning' | 'error') {
        const subject = new Subject<any>();
        let icon = '';
        if (alertType === 'information') {
            icon = 'fa-solid fa-circle-question';
        } else if (alertType === 'warning') {
            icon = 'fa-solid fa-triangle-exclamation';
        } else {
            icon = 'fa-solid fa-circle-xmark';
        }
        this.workflowDialog.answer = {
            icon,
            className: alertType,
            title: alertTitle,
            message: alertMessage,
            onCancel: null,
            onSet: () => {
                subject.next({
                    transitionKey: 'done',
                    transfers: [],
                });
            }
        };

        return subject.asObservable();
    }
}
