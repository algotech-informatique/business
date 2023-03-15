import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskFinisherDto {
    @IsOptional()
    save: CustomResolver<boolean>;

    @IsOptional()
    displayMode: CustomResolver<string>;

    @IsOptional()
    outputTrigger: CustomResolver<string>;

    @IsDefined()
    timeout: CustomResolver<number>;

    @IsDefined()
    message: CustomResolver<string>;

    @IsOptional()
    type: CustomResolver<string>;
}
