import { IsDefined, IsOptional } from 'class-validator';
import { PairDto, SmartObjectDto } from '@algotech-ce/core';
import { CustomResolver } from '../custom-resolver.type';

export class TaskAssignObjectDto {
    @IsDefined()
    object: CustomResolver<SmartObjectDto|SmartObjectDto[]>;
    @IsDefined()
    properties: CustomResolver<PairDto[]>;
    @IsDefined()
    skills: CustomResolver<PairDto[]>;
    @IsOptional()
    cumul: CustomResolver<Boolean>;
}
