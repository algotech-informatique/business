import { TaskBase } from './task-base';
import { zip, Observable, of, concat } from 'rxjs';
import { map, catchError, toArray, first, mergeMap } from 'rxjs/operators';
import { PairDto, SmartObjectDto, SmartModelDto } from '@algotech/core';
import * as _ from 'lodash';
import { InterpretorTaskDto, InterpretorValidateDto, InterpretorTransferTransitionDto, TaskAssignObjectDto } from '../dto';
import { TaskAssignObjectError } from '../error/tasks-error';
import { InterpretorSoUtils } from '../interpretor-reader/interpretor-so/interpretor-so-utils';

export class TaskAssignObject extends TaskBase {

    smartObjects: SmartObjectDto[];
    properties: PairDto[] = [];
    skills: PairDto[] = [];
    cumul = true;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        // reinitialize
        this.smartObjects = null;
        this.properties = [];
        this.skills = [];

        const customData = (task.custom as TaskAssignObjectDto);
        return zip(
            customData.object(),
            customData.properties ? customData.properties({ formatted: true }) : of([]),
            customData.skills ? customData.skills() : of([]),
            customData.cumul ? customData.cumul() : of(true),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-001', err, TaskAssignObjectError);
            }),
            mergeMap((values: any[]) => {
                this.smartObjects = _.isArray(values[0]) ? values[0] : [values[0]];

                this.properties = values[1];
                this.properties = _.reduce(this.properties, (results, p: PairDto) => {
                    const split = InterpretorSoUtils.split(p.key);

                    // new format
                    if (split.length > 1) {
                        if (this.smartObjects.length > 0 && split[0] === this.smartObjects[0].modelKey) {
                            results.push({
                                key: split[1],
                                value: p.value
                            });
                        }
                        return results;
                    }

                    // old format
                    results.push(p);
                    return results;
                }, []);

                this.skills = values[2];
                this.cumul = values[3];

                const transfers: InterpretorTransferTransitionDto[] = [];
                const transfers$ = concat(...this.smartObjects.map((smartObject: SmartObjectDto) => {

                    this._createObject(smartObject, task.instance.context.smartmodels);
                    return this.skillsUtils.createSkills(smartObject, this.skills, task.instance).pipe(
                        map((skTransfers: InterpretorTransferTransitionDto[]) => {
                            transfers.push(
                                this._loadSOTransfer(smartObject),
                                ...skTransfers,
                            );
                        }),
                        first(),
                    );
                })).pipe(toArray());

                return transfers$.pipe(map(() => transfers));
            }),
            map((transfers: InterpretorTransferTransitionDto[]) => {
                return this._computevalidation(transfers);
            })
        );
    }

    _createObject(smartObject: SmartObjectDto, smartmodels: SmartModelDto[]) {
        const model = this.soUtils.getModel(smartObject.modelKey, smartmodels);
        this.soUtils.repairInstance(smartObject, model);
        this.soUtils.createObjectProperties(smartObject, model, this.properties, this.cumul);
    }

    _loadSOTransfer(smartObject: SmartObjectDto): InterpretorTransferTransitionDto {
        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'smartobjects',
            value: smartObject
        };
        return transfer;
    }

    _computevalidation(transfers: InterpretorTransferTransitionDto[]): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers
        };

        return validation;
    }
}
