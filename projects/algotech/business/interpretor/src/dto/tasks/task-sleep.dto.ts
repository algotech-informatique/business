import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskSleepDto {

    @IsDefined()
    due: CustomResolver<number>;
}
