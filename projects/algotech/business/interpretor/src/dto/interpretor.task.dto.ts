import { IsString, IsDefined, ValidateNested, IsArray } from 'class-validator';
import { TaskTransitionModelDto, WorkflowInstanceDto } from '@algotech/core';
import { Type } from 'class-transformer';
import { BreadCrumbDto } from './step-breadcrumb.dto';

// @dynamic
export class InterpretorTaskDto {
    @IsString()
    @IsDefined()
    type: string;

    @IsDefined()
    custom: any;

    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => TaskTransitionModelDto)
    transitions: TaskTransitionModelDto[];

    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => BreadCrumbDto)
    stepBreadCrumb: BreadCrumbDto[];

    @IsArray()
    @IsDefined()
    @ValidateNested()
    @Type(() => BreadCrumbDto)
    taskBreadCrumb: BreadCrumbDto[];

    @IsDefined()
    @ValidateNested()
    @Type(() => WorkflowInstanceDto)
    instance: WorkflowInstanceDto;
}
