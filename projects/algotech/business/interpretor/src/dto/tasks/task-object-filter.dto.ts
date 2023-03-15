import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto, SmartModelDto } from '@algotech/core';

export class TaskObjectFilterDto {
    @IsDefined()
    objects: CustomResolver<SmartObjectDto[]>;

    @IsDefined()
    smartModel: CustomResolver<SmartModelDto>;

    @IsOptional()
    filterProperty: CustomResolver<string>;

    @IsOptional()
    filterValue: CustomResolver<string>;
}
