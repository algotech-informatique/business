import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SmartObjectDto } from '@algotech/core';
import { PropertiesOptionsDto } from '../../dto/properties-options.dto';

export class TaskFormDto {
    @IsOptional()
    title: CustomResolver<string>;

    @IsOptional()
    description: CustomResolver<string>;

    @IsDefined()
    object: CustomResolver<SmartObjectDto>;

    @IsDefined()
    options: CustomResolver<PropertiesOptionsDto[]>;

    @IsOptional()
    readOnly: CustomResolver<boolean>;

    @IsOptional()
    activeTag?: CustomResolver<boolean>;

    @IsOptional()
    modelsTag?: CustomResolver<string[]>;
}
