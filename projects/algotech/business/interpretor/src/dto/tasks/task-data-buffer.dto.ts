import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskDataBufferDto {
    @IsOptional()
    data: CustomResolver<any>;

    @IsDefined()
    cumul: CustomResolver<boolean>;
}
