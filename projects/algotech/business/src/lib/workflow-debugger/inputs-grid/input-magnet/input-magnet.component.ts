import { SettingsDataService } from '@algotech-ce/angular';
import { ApplicationModelDto, PairDto, SnPageWidgetDto } from '@algotech-ce/core';
import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { InputMagnet } from '../dto/input-magnet.dto';
import { InputsGridService } from '../inputs-grid.service';
@Component({
    selector: 'input-grid-magnet',
    styleUrls: ['./input-magnet.component.scss'],
    templateUrl: './input-magnet.component.html'
})
export class InputMagnetComponent implements OnChanges {

    @Input() inputMagnet;
    @Output() changed = new EventEmitter();

    magnets: InputMagnet[];
    zonesList: PairDto[];

    constructor(
        private gridService: InputsGridService,
        private settingsDataService: SettingsDataService,
    ) { }

    ngOnChanges() {
        if (this.inputMagnet.value) {
            this.magnets = [this.inputMagnet.value];
            this.zonesList = this.getAppZones(this.inputMagnet.value?.appKey);
        } else {
            this.magnets = [{
                appKey: '',
                magnetsZoneKey: '',
                x: 0,
                y: 0,
            }];
        }
    }

    updateMagnet(dataMagnet: InputMagnet) {
        this.onChanged(dataMagnet);
    }

    onClickMore(dataMagnet: InputMagnet) {
        this.gridService.searchObject(null, this.inputMagnet.type, this.inputMagnet.multiple,
            _.isArray(this.inputMagnet.value) ? this.inputMagnet.value : null).subscribe((value) => {
            if (value) {
                this.updateValue(value, dataMagnet);
            }
        });
    }

    updateValue(value: { app: ApplicationModelDto, zones: SnPageWidgetDto[] }, dataMagnet: InputMagnet) {
        dataMagnet.appKey = value.app?.key;
        dataMagnet.magnetsZoneKey = value.zones[0]?.custom?.key;
        this.zonesList = this.getZonesList(value.zones);
        this.onChanged(dataMagnet);
    }

    onChanged(dataMagnet: InputMagnet) {
        const data = { 'input': this.inputMagnet, 'data': dataMagnet };
        this.changed.emit(data);
    }

    private getAppZones(appKey: string) {
        const app: ApplicationModelDto = _.find(this.settingsDataService.apps, { key: appKey });
        return this.getZonesList(this.gridService.getAppZones(app?.snApp));
    }

    private getZonesList(zones: SnPageWidgetDto[]): PairDto[] {
        return _.map(zones, (zone: SnPageWidgetDto) => {
            return {
                key: zone.custom?.key,
                value: zone.custom?.key,
            };
        });
    }

}
