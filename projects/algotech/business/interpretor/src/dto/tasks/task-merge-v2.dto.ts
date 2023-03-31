import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartModelDto, SmartObjectDto } from '@algotech-ce/core';

export class TaskMergeV2Dto {

    @IsDefined()
    smartModel: CustomResolver<SmartModelDto>;

    @IsDefined()
    array: CustomResolver<SmartObjectDto[]>;

    @IsOptional()
    propType: CustomResolver<string[]>;

    @IsOptional()
    propToMerge: CustomResolver<string[]>;

    @IsOptional()
    saveOnApi: CustomResolver<boolean>;
}
