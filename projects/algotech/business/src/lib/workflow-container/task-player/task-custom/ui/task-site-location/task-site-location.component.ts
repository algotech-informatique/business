import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { TaskSiteLocationDto } from '../../../../dto/task-site-location.dto';
import { zip, of } from 'rxjs';
import { StartNavigation } from '@proteansoftware/capacitor-start-navigation';
import { SmartObjectDto, GeoDto } from '@algotech-ce/core';
import { TaskSiteLocationError } from '../../../../container-error/container-error';
import * as _ from 'lodash';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TaskSiteLocationService } from '../@services/task-site-location.service';
import { TranslateService } from '@ngx-translate/core';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    templateUrl: './task-site-location.component.html',
    styleUrls: ['./task-site-location.style.scss']
})
export class TaskSiteLocationComponent implements TaskComponent {
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    buttonText;
    smartObject: SmartObjectDto;
    geoLocation: GeoDto;

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskSiteLocationDto;
        zip(
            customData.launchGPS ? customData.launchGPS() : of(''),
            customData.objectLinked())
            .subscribe((values: any[]) => {
                if (!values || values.length !== 2) {
                    this.handleError.emit(this.taskUtils.handleError('ERR-007', 
                    new TaskSiteLocationError('', ''), TaskSiteLocationError));
                } else {
                    this.buttonText = values[0] ? values[0] : this.translate.instant('SN-GPS');
                    this.smartObject = values[1];

                    this.onLoad();
                }
            }, (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-086', err, TaskSiteLocationError));
            });
    }

    constructor(
        private translate: TranslateService,
        private taskSiteLocationService: TaskSiteLocationService,
        private taskUtils: TaskUtilsService
    ) { }

    onLoad() {
        this.openLocation(false);
        this.geoLocation = this.taskSiteLocationService.getGPSLocation(this.smartObject);
        if (this.geoLocation) {
            this.openLocation(false);
        }
    }

    openLocation(launch = true) {

        const locationInfo = this.taskSiteLocationService.openLocation(this.smartObject);
        if (launch && this.geoLocation) {
            this.launchGPS(this.geoLocation.geometries[0].coordinates[0], this.geoLocation.geometries[0].coordinates[1]);
        }

        // transfer not required
        const transfs: InterpretorTransferTransitionDto[] = [];
        if (this.taskSiteLocationService._getTransitionData(this._task)) {
            transfs.push(this.taskSiteLocationService.transferConstruction(locationInfo, this._task));
        }

        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: transfs
        };

        this.partialValidate.emit({ validation, authorizationToNext: true });
    }

    launchGPS(longitude: number, latitude: number) {
        StartNavigation.launchMapsApp({
            latitude,
            longitude
        });
    }
}
