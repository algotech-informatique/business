import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto, SmartModelDto, SmartObjectDto } from '@algotech-ce/core';

export class TaskMergeDto {

    @IsDefined()
    smartModel: CustomResolver<SmartModelDto>;

    @IsDefined()
    array: CustomResolver<SmartObjectDto[]>;

    @IsOptional()
    propType: CustomResolver<string[]>;

    @IsOptional()
    saveOnApi: CustomResolver<boolean>;
}
