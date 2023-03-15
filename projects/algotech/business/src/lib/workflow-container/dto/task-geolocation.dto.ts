import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SmartObjectDto } from '@algotech/core';

export class TaskGeolocationDto {
    @IsOptional()
    geoObjects: CustomResolver<SmartObjectDto[]>;

    @IsDefined()
    timeout: CustomResolver<number>;

    @IsOptional()
    maximumAge: CustomResolver<number>;

    @IsDefined()
    highAccuracy: CustomResolver<boolean>;

    @IsOptional()
    waitingMessage: CustomResolver<string[]>;
}
