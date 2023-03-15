import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto } from '@algotech/core';

export class TaskRequestResultDto {

    @IsDefined()
    inputs: CustomResolver<any>;

    @IsOptional()
    format: CustomResolver<PairDto[]>;

    @IsOptional()
    code: CustomResolver<number>;
}
