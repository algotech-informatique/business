import { PairDto } from '@algotech-ce/core';
import { IsDefined } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskSwitchDto {

    @IsDefined()
    switchAValue: CustomResolver<any>;

    @IsDefined()
    criterias: CustomResolver<PairDto[]>;
}
