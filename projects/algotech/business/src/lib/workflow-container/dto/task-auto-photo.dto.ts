import { IsDefined, IsOptional } from 'class-validator';
import { SmartObjectDto } from '@algotech-ce/core';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TaskAutoPhotoDto {
    @IsDefined()
    objectLinked: CustomResolver<SmartObjectDto>;
    @IsOptional()
    tags: CustomResolver<string[]>;
    @IsDefined()
    defaultName: CustomResolver<string>;
    @IsDefined()
    accessLocalStorage: CustomResolver<boolean>;
}
