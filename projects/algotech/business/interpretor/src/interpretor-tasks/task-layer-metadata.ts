import { Observable, of, zip } from 'rxjs';
import { InterpretorValidateDto, InterpretorTaskDto, TaskLayerMetadataDto, InterpretorTransferTransitionDto } from '../dto';
import { TaskBase } from './task-base';
import { map, catchError } from 'rxjs/operators';
import { TaskLayerMetadataError } from '../error/tasks-error';
import { GeoDto, PairDto, PlanContainersSettingsDto, MetaDatasDto, SmartObjectDto } from '@algotech/core';
import * as _ from 'lodash';

export class TaskLayerMetadata extends TaskBase {

    _task: InterpretorTaskDto;
    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {

        this._task = task;
        const customData = (task.custom as TaskLayerMetadataDto);
        return zip(
            customData.location ? customData.location() : of(null),
            customData.results ? customData.results() : of([]),
            customData.type ? customData.type() : of(''),
        ).pipe(
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-055', err, TaskLayerMetadataError);
            }),
            map((values: any[]) => {
                const item: any = values[0];
                const mappedList: PairDto[] = values[1];
                const _type = values[2];

                const metadatas: PairDto[] = _type === 'sys:file' ? this._createDataForDoc(item) : this._createData(item);
                return this._createDataTransfer(mappedList, metadatas);
            })
        );
    }

    _createDataForDoc(doc: any): PairDto[] {
        if (!doc) {
            return [];
        }
        return doc.metadatas;
    }

    _createData(location: any): PairDto[] {
        if (!location) {
            return [];
        }
        if (location instanceof SmartObjectDto) {
            const so: SmartObjectDto = location as SmartObjectDto;
            if (so.skills.atGeolocation) {
                return this.getMetadatas(so.skills.atGeolocation.geo[0].layerKey);
            }
        } else {
            const loc: GeoDto = location as GeoDto;
            return this.getMetadatas(loc.layerKey);
        }
    }

    _createDataTransfer(mappedList: PairDto[], metadatas: PairDto[]): InterpretorValidateDto {

        const mappedField: PairDto[] = this.objectMappedFields(mappedList, metadatas);
        const Transfers: InterpretorTransferTransitionDto[] = _.map(mappedField, (field: PairDto) => {
            return {
                type: 'sysobjects',
                data: {
                    key: field.key,
                    type: 'string',
                },
                saveOnApi: false,
                value: field.value,
            };
        });
        return {
            transitionKey: 'done',
            transfers: Transfers
        };
    }

    private objectMappedFields(mappedFields: PairDto[], objects: PairDto[]): PairDto[] {
        const obj1 = _.map(mappedFields, (field: PairDto) => {
            const obj: PairDto = _.find(objects, (object: PairDto) => object.key === field.key);
            field.value = (obj) ? obj.value : '';
            return field;
        });
        return obj1;
    }

    getMetadatas(layerKey: string): PairDto[] {
        const metas: MetaDatasDto[] = [];
        _.forEach(this._task.instance.context.settings.plan.containers, (container: PlanContainersSettingsDto) => {
            const dataLayer = _.find(container.layers, { key: layerKey });
            if (dataLayer) {
                metas.push(...dataLayer.metadatas);
                this.getMetadataByUuid(container.uuid, metas);
            }
        });
        return this.transformMetadatas(metas);
    }

    getMetadataByUuid(uuid: string, metadatas: MetaDatasDto[]) {
        const container: PlanContainersSettingsDto =
            _.find(this._task.instance.context.settings.plan.containers, (cont: PlanContainersSettingsDto) => cont.uuid === uuid);
        if (container) {
            metadatas.push(...container.metadatas);
            if (container.parentUuid) {
                return this.getMetadataByUuid(container.parentUuid, metadatas);
            }
        }
    }

    transformMetadatas(metadatas: MetaDatasDto[]): PairDto[] {
        return _.map(metadatas, (meta: MetaDatasDto) => {
            const pair: PairDto = {
                key: meta.key,
                value: meta.value
            };
            return pair;
        });
    }
}
