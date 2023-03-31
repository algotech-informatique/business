import { IsDefined, IsOptional } from 'class-validator';
import { SmartObjectDto } from '@algotech-ce/core';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TaskCameraDto {
    @IsDefined()
    displayName: CustomResolver<string>;

    @IsDefined()
    multiple: CustomResolver<boolean>;

    @IsDefined()
    objectLinked: CustomResolver<SmartObjectDto>;

    @IsDefined()
    defaultName: CustomResolver<string>;

    @IsDefined()
    editionAnnotation: CustomResolver<boolean>;

    @IsDefined()
    accessLocalStorage: CustomResolver<boolean>;

    @IsOptional()
    activeTag?: CustomResolver<boolean>;

    @IsOptional()
    modelsTag?: CustomResolver<string[]>;
}
