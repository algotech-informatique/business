import { Observable, throwError, of, zip } from 'rxjs';
import { SmartModelDto, SmartObjectDto, PairDto } from '@algotech/core';
import * as _ from 'lodash';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { TaskBase } from './task-base';
import { InterpretorValidateDto, InterpretorTaskDto, InterpretorTransferTransitionDto, TaskObjectCreateDto } from '../dto';
import { TaskObjectCreateError, TaskCreateObjectError } from '../error/tasks-error';

export class TaskObjectCreate extends TaskBase {

    smartModel: SmartModelDto;
    properties: PairDto[] = [];
    skills: PairDto[] = [];
    cumul: boolean;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            throw new TaskObjectCreateError('ERR-013', '{{TASK-PARAMETERS-CORRUPTED}}');
        }

        const customData = (task.custom as TaskObjectCreateDto);
        return zip(
            customData.smartModel(),
            customData.properties ? customData.properties({ formatted: true }) : of([]),
            customData.skills ? customData.skills() : of([]),
            customData.cumul ? customData.cumul() : of(true),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-014', err, TaskCreateObjectError);
            }),
            mergeMap((values: any[]) => {
                this.smartModel = values[0];
                this.properties = values[1];
                this.skills = values[2];
                this.cumul = values[3];

                const transferKey = task.transitions[0].data[0].key;
                const transferType = task.transitions[0].data[0].type;
                const soInstance: SmartObjectDto = this.soUtils.createInstance(this.smartModel);

                if (!soInstance) {
                    return throwError(new TaskObjectCreateError('ERR-015', '{{SMARTMODEL-CANT-BE-CREATED}}'));
                } else {

                    this.soUtils.createObjectProperties(soInstance, this.smartModel, this.properties, this.cumul);
                    return this.skillsUtils.createSkills(soInstance, this.skills, task.instance).pipe(
                        map((transfers: InterpretorTransferTransitionDto[]) => {
                            return [
                                this._loadSOTransfer(soInstance, transferKey, transferType),
                                ...transfers,
                            ];
                        })
                    );
                }
            }),
            map((transfers: InterpretorTransferTransitionDto[]) => {
                return this._computevalidation(transfers);
            })
        );
    }

    _computevalidation(transfers: InterpretorTransferTransitionDto[]): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers
        };
        return validation;
    }

    _loadSOTransfer(smartObject: SmartObjectDto, transferKey: string, transferType: string): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data: {
                key: transferKey,
                type: transferType
            },
            type: 'smartobjects',
            value: smartObject
        };
        return transfer;
    }
}
