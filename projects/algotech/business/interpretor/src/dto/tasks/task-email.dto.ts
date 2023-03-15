import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SysFile } from '@algotech/core';

export class TaskEmailDto {
    @IsDefined()
    direct: CustomResolver<boolean>;
    @IsDefined()
    profiles: CustomResolver<string[]>;
    @IsDefined()
    adress: CustomResolver<string[]>;
    @IsDefined()
    subject: CustomResolver<string>;
    @IsDefined()
    body: CustomResolver<string>;
    @IsDefined()
    implicit: CustomResolver<boolean>;
    @IsDefined()
    linkedFiles: CustomResolver<SysFile | SysFile[]>;
    @IsOptional()
    html: CustomResolver<boolean>;
}
