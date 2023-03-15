import { IsDefined } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { ScheduleDto } from '@algotech/core';

export class TaskScheduleDeleteDto {
    @IsDefined()
    schedules: CustomResolver<ScheduleDto[]>;
}
