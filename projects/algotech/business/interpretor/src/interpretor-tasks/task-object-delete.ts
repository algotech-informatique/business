import { Observable, zip } from 'rxjs';
import * as _ from 'lodash';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, InterpretorTransferTransitionDto, TaskObjectDeleteDto } from '../dto';
import { TaskObjectDeleteError } from '../error/tasks-error';

export class TaskObjectDelete extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const customData = (task.custom as TaskObjectDeleteDto);
        return zip(
            customData.objects(),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-016', err, TaskObjectDeleteError);
            }),
            map((values: any[]) => {
                const smartobjects = _.isArray(values[0]) ? values[0] : [values[0]];
                const validation: InterpretorValidateDto = {
                    transitionKey: 'done',
                    transfers: _.map(_.compact(smartobjects), (smartobject) => {
                        const transfer: InterpretorTransferTransitionDto = {
                            saveOnApi: true,
                            type: 'action',
                            value: {
                                actionKey: 'delete',
                                value: smartobject.uuid,
                            }
                        };
                        return transfer;
                    }),
                };
                return validation;
            })
        );
    }
}
