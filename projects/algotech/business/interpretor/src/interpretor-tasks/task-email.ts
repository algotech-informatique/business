import { Observable, zip, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { EMailDto, SysFile } from '@algotech/core';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto } from '../dto';
import { TaskEmailDto } from '../dto/tasks/task-email.dto';
import { TaskEmailError } from '../error/tasks-error';

export class TaskEmail extends TaskBase {

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskEmailDto);
        return zip(
            customData.direct ? customData.direct() : of(false),
            customData.profiles ? customData.profiles() : of([]),
            customData.adress ? customData.adress() : of([]),
            customData.subject(),
            customData.body ? customData.body() : of(''),
            customData.linkedFiles ? customData.linkedFiles() : of([]),
            customData.html ? customData.html() : of(false),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-006', err, TaskEmailError);
            }),
            map((values: any[]) => {
                const files: SysFile[] = _.isArray(values[5]) ? values[5] : [values[5]];
                const eMail: EMailDto = {
                    to: values[0] ? _.map(values[2], (adress) => `adress:${adress}`) : values[1],
                    subject: values[3],
                    content: values[4],
                    linkedFiles: _.map(files, 'versionID'),
                    html: values[6],
                };

                const validation: InterpretorValidateDto = {
                    transitionKey: 'send',
                    transfers: [
                        {
                            saveOnApi: true,
                            type: 'action',
                            value: {
                                actionKey: 'mail',
                                value: eMail
                            }
                        }
                    ]
                };
                return validation;
            })
        );
    }
}
