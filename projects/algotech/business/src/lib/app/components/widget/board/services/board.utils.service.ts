import { AuthService } from '@algotech-ce/angular';
import { SnPageWidgetDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MagnetUtils } from '../../../../../../../interpretor/src/@utils/magnet-utils';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';

@Injectable()
export class BoardUtilsService extends MagnetUtils {
    constructor(private authService: AuthService, private soUtilsService: SoUtilsService) {
        super(soUtilsService);
    }

    authorizeToMove(template: SnPageWidgetDto) {
        if (!template) {
            return false;
        }
        if (!template.custom.permissions || !Array.isArray(template.custom.permissions)) {
            return false;
        }
        return _.intersection(template.custom.permissions, this.authService.localProfil.groups).length > 0;
    }
}
