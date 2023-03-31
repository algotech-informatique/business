import { Observable, zip, of } from 'rxjs';
import { SmartObjectDto } from '@algotech-ce/core';
import * as _ from 'lodash';
import { map, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto, TaskObjectDownloadDto } from '../dto';
import { TaskObjectDownloadError } from '../error/tasks-error';

export class TaskObjectDownload extends TaskBase {

    _task: InterpretorTaskDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        this._task = task;
        const customData = (task.custom as TaskObjectDownloadDto);
        return zip(
            customData.objects(),
            customData.first ? customData.first() : of(false),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-017', err, TaskObjectDownloadError);
            }),
            map((values: any[]) => {
                const first: boolean = values[1];
                const objects: SmartObjectDto[] = values[0];

                if (first) {
                    return this._computevalidation(task, objects.length > 0 ? objects[0] : null);
                } else {
                    return this._computevalidation(task, objects);
                }
            })
        );
    }

    _computevalidation(task: InterpretorTaskDto, smartObjects: SmartObjectDto | SmartObjectDto[]): InterpretorValidateDto {
        // push so directly on instance
        const objects = Array.isArray(smartObjects) ? smartObjects : [smartObjects];
        for (const smartObject of objects) {
            if (!this._task.instance.smartobjects.find((so) => so.uuid === smartObject.uuid)) {
                this._task.instance.smartobjects.push(smartObject);
            }
        }

        const transfers: InterpretorTransferTransitionDto[] = smartObjects ? [{
            saveOnApi: false,
            ignoreOperations: true,
            data: this._getTransitionData(task),
            type: 'smartobjects',
            value: smartObjects
        }] : [];

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transfers
        };
        return validation;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskObjectDownloadError('ERR-018', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
