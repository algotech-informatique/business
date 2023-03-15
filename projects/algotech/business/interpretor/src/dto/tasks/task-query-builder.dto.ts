import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';

export class TaskQueryBuilderDto {
    @IsDefined()
    connection: CustomResolver<any>;

    @IsDefined()
    wizardMode: CustomResolver<boolean>;

    @IsOptional()
    plainQuery: CustomResolver<string>;
}
