import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto } from '@algotech/core';

export class TaskConnectorDto {

    @IsDefined()
    smartFlow: CustomResolver<string>;

    @IsOptional()
    inputs: CustomResolver<PairDto[]>;

    @IsOptional()
    runOutside: CustomResolver<boolean>;
}
