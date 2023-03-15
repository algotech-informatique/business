import * as _ from 'lodash';
import { TaskBase } from './task-base';
import { InterpretorTaskDto, InterpretorTransferTransitionDto, InterpretorValidateDto, TaskSkillsDto } from '../dto';
import { TaskSkillsError } from '../error/tasks-error';
import { Observable, zip, of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { GeoDto, SmartObjectDto, ZoneDto } from '@algotech/core';

export class TaskSkills extends TaskBase {
    _task: InterpretorTaskDto;

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        this._task = task;

        const customData = (task.custom as TaskSkillsDto);
        return zip(
            customData.object()
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-037', err, TaskSkillsError);
            }),
            mergeMap((values: any[]) => {
                return this._transfers(values[0]);
            }),
        );
    }
    private _transfers(smartobject: SmartObjectDto) {

        return zip(
            this.getSysFile(smartobject),
            this.getLocation(smartobject),
            this.getTags(smartobject),
            this.getSignature(smartobject),
            this.getMagnet(smartobject),
        ).pipe(
            map((values: any[]) => {
                const transfers: InterpretorTransferTransitionDto[] = [{
                    saveOnApi: false,
                    data: this._getTransitionData(0),
                    type: 'sysobjects',
                    value: values[0],
                }, {
                    saveOnApi: false,
                    data: this._getTransitionData(1),
                    type: 'sysobjects',
                    value: values[1],
                }, {
                    saveOnApi: false,
                    data: this._getTransitionData(2),
                    type: 'sysobjects',
                    value: values[2],
                }, {
                    saveOnApi: false,
                    data: this._getTransitionData(3),
                    type: 'sysobjects',
                    value: values[3],
                }, {
                    saveOnApi: false,
                    data: this._getTransitionData(4),
                    type: 'sysobjects',
                    value: values[4],
                }];
                const validation: InterpretorValidateDto = {
                    transitionKey: 'done',
                    transfers: transfers
                };

                return validation;
            })
        );
    }

    private getSysFile(smartobject: SmartObjectDto): Observable<any[]> {
        if (!smartobject.skills.atDocument?.documents) {
            return of([]);
        }
        return of(
            _.compact(smartobject.skills.atDocument?.documents.map((docUuid: string) => {
                const doc = this._task.instance.documents.find((d) => d.uuid === docUuid);
                if (doc) {
                    return this.sysUtils.transform(doc, 'sys:file', this._task.instance.context.user.preferedLang);
                }
            }))
        );
    }

    private getLocation(smartobject: SmartObjectDto): Observable<any[]> {
        if (!smartobject.skills.atGeolocation?.geo) {
            return of([]);
        }
        return of(smartobject.skills.atGeolocation?.geo.map((geo: GeoDto) => {
            return this.sysUtils.transform(geo, 'sys:location', this._task.instance.context.user.preferedLang);
        }));
    }

    private getTags(smartobject: SmartObjectDto): Observable<any[]> {
        if (!smartobject.skills.atTag?.tags) {
            return of([]);
        }
        return of(smartobject.skills.atTag?.tags);
    }

    private getSignature(smartobject: SmartObjectDto): Observable<any> {
        if (!smartobject.skills.atSignature) {
            return of(null);
        }
        return this.reportsUtils.getFileB64(smartobject.skills.atSignature.signatureID, this._task.instance.context).pipe(
            map((signatureBase64) => {
                return Object.assign(
                    _.cloneDeep(smartobject.skills.atSignature),
                    {
                        signatureBase64
                    }
                );
            })
        );
    }

    private getMagnet(smartobject: SmartObjectDto): Observable<any> {
        if (!smartobject.skills.atMagnet?.zones) {
            return of([]);
        }
        return of(smartobject.skills.atMagnet?.zones.map((zone: ZoneDto) => {
            return this.sysUtils.transform(zone, 'sys:magnet', this._task.instance.context.user.preferedLang);
        }));
    }

    private _getTransitionData(idx: number): { key: string, type: string } {
        if (this._task.transitions.length === 0 ||
            this._task.transitions[0].data.length <= idx ||
            !this._task.transitions[0].data[idx].key ||
            !this._task.transitions[0].data[idx].type) {
            throw new TaskSkillsError('ERR-038', '{{TASK-PARAMETERS-CORRUPTED}}');
        }
        return {
            key: this._task.transitions[0].data[idx].key,
            type: this._task.transitions[0].data[idx].type
        };
    }
}
