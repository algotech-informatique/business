import { PairDto } from '@algotech-ce/core';
import { IsDefined } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskConditionV2Dto {

    @IsDefined()
    conditionAValue: CustomResolver<any>;

    @IsDefined()
    criterias: CustomResolver<PairDto[]>;
}
