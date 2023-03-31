import { Observable, zip, of, throwError } from 'rxjs';
import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto, TaskCsvMappedDto } from '../dto';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { TaskCsvMappedError } from '../error/tasks-error';
import { SmartObjectDto, SysFile } from '@algotech-ce/core';

export class TaskCsvMapped extends TaskBase {

    saveOnApi = true;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskCsvMappedDto);
        return zip(
            customData.file(),
            customData.smartModel(),
            customData.delimiter ? customData.delimiter() : of(''),
            customData.dateFormat ? customData.dateFormat() : of([]),
            customData.saveOnApi ? customData.saveOnApi() : of(true),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-039', err, TaskCsvMappedError);
            }),
            mergeMap((values: any[]) => {
                const file: SysFile = values[0];
                const smartModel = values[1];
                const delimiter = values[2];
                const propertiesFormat = values[3];
                this.saveOnApi = values[4];

                if (file.ext !== 'csv') {
                    return throwError(new TaskCsvMappedError('ERR-040', `{{FILE-IS-NOT-CSV}}`));
                }

                return this.reportsUtils.getFile(file.versionID, task.instance.context).pipe(
                    mergeMap((binary) => {
                        if (!binary) {
                            return throwError(new TaskCsvMappedError('ERR-041', `{{FILE-UNKNOWN}}`))
                        }
                        return this.soUtils.csvToSo(binary, smartModel, { 
                            delimiter,
                            propertiesFormat
                        });
                    }),
                    map((smartObjects: SmartObjectDto[]) => {
                        return this.taskUtils.computevalidation([
                            this._loadTransfer(smartObjects, task)
                        ]);
                    })
                )
            }),
        );
    }

    _loadTransfer(smartObjects: SmartObjectDto[], task: InterpretorTaskDto): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            data: this.taskUtils.getTransitionData(task),
            saveOnApi: this.saveOnApi,
            type: 'smartobjects',
            value: smartObjects
        };
        return transfer;
    }
}
