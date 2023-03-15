import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskLoopDto {

    @IsDefined()
    forEach: CustomResolver<boolean>;

    @IsOptional()
    count: CustomResolver<number>;

    @IsOptional()
    items: CustomResolver<any>;

}
