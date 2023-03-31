import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { PairDto, SmartModelDto, SmartObjectDto, SysFile } from '@algotech-ce/core';

export class TaskConvertDto {

    @IsDefined()
    inputFile: CustomResolver<SysFile>;

    @IsDefined()
    fileName: CustomResolver<string>;

    @IsDefined()
    download: CustomResolver<boolean>;

    @IsDefined()
    save: CustomResolver<boolean>;

    @IsDefined()
    object: CustomResolver<SmartObjectDto>;

    @IsOptional()
    version: CustomResolver<SysFile>;

}
