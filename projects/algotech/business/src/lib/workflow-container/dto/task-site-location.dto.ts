import { IsDefined } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SmartObjectDto } from '@algotech/core';

export class TaskSiteLocationDto {
    @IsDefined()
    objectLinked: CustomResolver<SmartObjectDto>;
    @IsDefined()
    title: CustomResolver<string>;
    @IsDefined()
    launchGPS: CustomResolver<string>;

}

