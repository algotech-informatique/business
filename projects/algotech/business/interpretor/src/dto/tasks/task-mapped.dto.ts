import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto, SmartModelDto } from '@algotech-ce/core';

export class TaskMappedDto {

    @IsDefined()
    object: CustomResolver<any>;

    @IsDefined()
    autoMapped: CustomResolver<boolean>;

    @IsDefined()
    smartModel: CustomResolver<SmartModelDto>;

    @IsOptional()
    fields: CustomResolver<PairDto[]>;

    @IsOptional()
    saveOnApi: CustomResolver<boolean>;
}
