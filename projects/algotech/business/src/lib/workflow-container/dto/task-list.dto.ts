import { SmartObjectDto, WorkflowModelDto, UserDto, ScheduleDto } from '@algotech/core';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { IsDefined, IsOptional } from 'class-validator';
export class TaskListDto {
    @IsDefined()
    title: CustomResolver<string>;
    @IsDefined()
    items: CustomResolver<SmartObjectDto[] | WorkflowModelDto[] | UserDto[]>;
    @IsDefined()
    columnsDisplay: CustomResolver<string[]>;
    @IsOptional()
    multipleSelection: CustomResolver<boolean>;
    @IsOptional()
    cart: CustomResolver<boolean>;
    @IsOptional()
    search: CustomResolver<boolean>;
    @IsOptional()
    pagination: CustomResolver<boolean>;
    @IsOptional()
    excludeObjects: CustomResolver<SmartObjectDto[] | ScheduleDto[]>;
    @IsOptional()
    filterProperty: CustomResolver<string>;
    @IsOptional()
    filterActive: CustomResolver<string>;
    @IsOptional()
    loop: CustomResolver<boolean>;
    @IsOptional()
    searchValue: CustomResolver<string>;
}
