import { SmartObjectsService } from '@algotech-ce/angular';
import { SmartObjectDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { SkillsUtils } from '../../../../interpretor/src';
import { SoUtilsService } from './so-utils.service';

@Injectable()
export class SkillsUtilsService extends SkillsUtils {
    constructor(private soUtilsService: SoUtilsService, private smartObjectsService: SmartObjectsService) {
        super(soUtilsService);
    }

    getMagnets(appKey: string, boardInstance: string, zoneKey: string): Observable<SmartObjectDto[]> {
        return this.smartObjectsService.getMagnets(appKey, boardInstance, zoneKey);
    }
}
