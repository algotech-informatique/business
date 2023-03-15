import { SettingsDataService } from '@algotech/angular';
import { GeoDto, GeometryDto, PlanContainersSettingsDto, PlanLayersSettingsDto, SmartObjectDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { InterpretorTaskDto, InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src';

@Injectable()
export class TaskSiteLocationService {

    constructor(
        private settingsService: SettingsDataService,
    ) {
    }

    openLocation(smartObject: SmartObjectDto) {

        let carto: GeoDto = this.getGPSLocation(smartObject);
        if (!carto) {
            carto = this.getFirstLocation(smartObject);
        }
        const geo: GeometryDto = carto.geometries[0];
        let layer = '';
        let type = '';
        let lat = 0;
        let lng = 0;

        if (carto !== null) {
            layer = carto.layerKey;
            type = geo.type;
            lat =  geo.coordinates[0];
            lng = geo.coordinates[1];
        }

        const locationInfo = {
            layerKey: layer,
            type: type,
            coordinates: geo ? geo.coordinates : [],
        };
        return locationInfo;
    }

    transferConstruction(selectedGeo, task: InterpretorTaskDto): InterpretorTransferTransitionDto {
        return {
            saveOnApi: true,
            data: this._getTransitionData(task),
            type: 'sysobjects',
            value: selectedGeo
        };
    }

    _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
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

    getFirstLocation(smartObject: SmartObjectDto): GeoDto {
        if (!smartObject.skills || !smartObject.skills.atGeolocation || !smartObject.skills.atGeolocation.geo) {
            return null;
        }
        return smartObject.skills.atGeolocation.geo[0];
    }

    getGPSLocation(smartObject: SmartObjectDto): GeoDto {

        if (!smartObject.skills || !smartObject.skills.atGeolocation || !smartObject.skills.atGeolocation.geo) {
            return null;
        }
        const layers: PlanLayersSettingsDto[] = this.returnLayers();
        const geoPos: GeoDto[] = _.reduce(smartObject.skills.atGeolocation.geo, (result, geo: GeoDto) => {
            if (this.getPlanGEO(geo.layerKey, layers) ) {
                result.push(geo);
            }
            return result;
        }, []);
        return (geoPos && geoPos.length !== 0) ? geoPos[0] : null;
    }

    private getPlanGEO(layerKey: string, layers: PlanLayersSettingsDto[]) {
        const findIndex = _.findIndex(layers, (lay: PlanLayersSettingsDto) => lay.key === layerKey && lay.layerType === 'mapWorld');
        return (findIndex !== -1);
    }

    private returnLayers(): PlanLayersSettingsDto[] {
        const lays = _.reduce(this.settingsService.settings.plan.containers, (result, cont: PlanContainersSettingsDto) => {
            if (cont.layers.length !== 0) {
                result.push(...cont.layers);
            }
            return result;
        }, []);
        return lays;
    }
}
