import { SmartModelDto, PairDto } from '@algotech-ce/core';
import { CustomResolver } from '../custom-resolver.type';
import { IsDefined, IsOptional } from 'class-validator';

export class TaskObjectCreateDto {
    @IsDefined()
    smartModel: CustomResolver<SmartModelDto>;
    @IsOptional()
    properties: CustomResolver<PairDto[]>;
    @IsOptional()
    skills: CustomResolver<PairDto[]>;
    @IsOptional()
    cumul: CustomResolver<Boolean>;

}
