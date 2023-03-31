import { TaskService } from '../../task-service.interface';

import { Observable, zip, of } from 'rxjs';
import { map, catchError, finalize, mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { WorkflowInstanceDto, GeometryDto, GeoDto, SmartObjectDto } from '@algotech-ce/core';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import * as _ from 'lodash';

import { TaskGeolocationError } from '../../../../container-error/container-error';
import { TaskGeolocationDto } from '../../../../dto/task-geolocation.dto';
import { UUID } from 'angular2-uuid';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { SysUtilsService } from '../../../../../workflow-interpretor/@utils/sys-utils.service';
import { GeoLocationService } from '@algotech-ce/angular';
import { WorkflowDialogService } from '../../../../../workflow-dialog/workflow-dialog.service';
import { WorkflowDialogLoad } from '../../../../../workflow-dialog/interfaces';

import { Position } from '@capacitor/geolocation';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Injectable()
export class TaskGeolocationService implements TaskService {

    constructor(
        private sysUtils: SysUtilsService,
        private workflowDialog: WorkflowDialogService,
        private geolocationService: GeoLocationService,
        private taskUtils: TaskUtilsService) {
    }

    execute(task: InterpretorTaskDto, instance: WorkflowInstanceDto): Observable<InterpretorValidateDto> {

        const customData = (task.custom as TaskGeolocationDto);
        return zip(
            customData.geoObjects ? customData.geoObjects() : of([]),
            customData.timeout(),
            customData.highAccuracy(),
            customData.maximumAge ? customData.maximumAge() : of(0),
            customData.waitingMessage ? customData.waitingMessage() : (''),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-090', err, TaskGeolocationError);
            }),
            mergeMap((values: any[]) => {
                const geoObjects: SmartObjectDto[] = Array.isArray(values[0]) ? values[0] : [values[0]];
                const timeout: number = values[1];
                const highAccuracy: boolean = values[2];
                const maximumAge: number = values[3];
                const waitingMessage: string = values[4];

                return this.recuperationGPS(geoObjects, timeout, highAccuracy, maximumAge, waitingMessage, task);
            })
        );
    }

    recuperationGPS(geoObjects: SmartObjectDto[], timeout: number, highAccuracy: boolean, maximumAge: number, waitingMessage: string,
        task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        const data = this._getTransitionData(task);
        if (!data) {
            return null;
        }

        const loader: WorkflowDialogLoad = { message: waitingMessage };
        this.workflowDialog.pushLoad(loader);

        const options: PositionOptions = {
            timeout: timeout,
            enableHighAccuracy: highAccuracy,
            maximumAge: maximumAge
        };

        return this.geolocationService.checkGPSPermission(options).pipe(
            map((resp: Position) => {
                if (resp && resp.coords) {
                    return this._createValidation(resp, geoObjects, data);
                } else {
                    throw new Error(`{{NO-GEOLOCATION-POSITION}}`);
                }

            }),
            catchError((error) => {
                throw new TaskGeolocationError('ERR-091', `{{GEOLOCATION-ERROR}} : ${error.message}`);
            }),
            finalize(() => {
                this.workflowDialog.popLoad(loader);
            })
        );
    }

    private _createValidation(geoposition: Position, geoObjects: SmartObjectDto[],
        data: { key: string, type: string }): InterpretorValidateDto {

        const geoLocal: GeometryDto = {
            coordinates: [
                geoposition.coords.latitude,
                geoposition.coords.longitude
            ],
            type: 'GPS'
        };
        const geo: GeoDto = {
            uuid: UUID.UUID(),
            layerKey: 'GPS',
            geometries: [geoLocal]
        };

        const transfersObjects = _.map(geoObjects, (geoObject: SmartObjectDto) => {
            if (geoObject.skills.atGeolocation) {
                geoObject.skills.atGeolocation.geo.push(geo);
            }
            const transfer: InterpretorTransferTransitionDto = {
                saveOnApi: true,
                type: 'smartobjects',
                value: geoObject
            };
            return transfer;
        });

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [
                ...transfersObjects,
                {
                    saveOnApi: true,
                    data: data,
                    type: 'sysobjects',
                    value: this.sysUtils.transform(geo, 'sys:location'),
                }
            ]
        };
        return validation;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
