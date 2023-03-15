import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskConditionDto {

    @IsDefined()
    conditionAValue: CustomResolver<any>;

    @IsOptional()
    conditionBValue: CustomResolver<any>;

    @IsDefined()
    condition: CustomResolver<string>;
}
