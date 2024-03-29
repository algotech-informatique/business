import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';

export class TaskNotify {
    @IsDefined()
    title: CustomResolver<string>;
    @IsDefined()
    content: CustomResolver<string>;
    @IsOptional()
    destination: CustomResolver<string>;
    @IsOptional()
    profiles: CustomResolver<string[]>;
    @IsOptional()
    profiles_viewer: CustomResolver<string[]>;
    @IsOptional()
    groups_viewer: CustomResolver<string[]>;
    @IsOptional()
    users_viewer: CustomResolver<string[]>;
    @IsOptional()
    channels: CustomResolver<string[]>;
}
