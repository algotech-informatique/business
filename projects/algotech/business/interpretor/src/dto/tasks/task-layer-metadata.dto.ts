import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto } from '@algotech/core';

export class TaskLayerMetadataDto {

    @IsDefined()
    location: CustomResolver<any>;

    @IsDefined()
    results: CustomResolver<PairDto[]>;

    @IsDefined()
    type: CustomResolver<string>;
}
