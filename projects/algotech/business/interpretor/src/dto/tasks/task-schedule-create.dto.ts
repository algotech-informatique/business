import { IsDefined, IsArray, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto, WorkflowModelDto, UserDto } from '@algotech/core';

export class TaskScheduleCreateDto {

    @IsDefined()
    title: CustomResolver<string>;

    @IsDefined()
    scheduleTypeKey: CustomResolver<string>;

    @IsArray()
    @IsDefined()
    linkedSO: CustomResolver<SmartObjectDto | SmartObjectDto[]>;

    @IsArray()
    @IsDefined()
    linkedWorkflow: CustomResolver<WorkflowModelDto | WorkflowModelDto[]>;

    @IsArray()
    @IsOptional()
    tags: CustomResolver<string[]>;

    @IsArray()
    @IsDefined()
    profiles: CustomResolver<string[]>;

    @IsArray()
    @IsDefined()
    assignedUsers: CustomResolver<UserDto[] | string[]>;

    @IsArray()
    @IsDefined()
    receivers: CustomResolver<UserDto | UserDto[]>;

    @IsOptional()
    beginDate: CustomResolver<string>;

    @IsOptional()
    endDate: CustomResolver<string>;

    @IsOptional()
    repetitionMode: CustomResolver<string>;

    @IsOptional()
    scheduleStatus: CustomResolver<string>;

    @IsOptional()
    scheduleTitle: CustomResolver<string>;
}
