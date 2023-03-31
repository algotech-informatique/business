import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto, SysFile } from '@algotech-ce/core';

export class TaskDocumentFileCreateDto {

    @IsDefined() 
    body: CustomResolver<string|Object>;

    @IsDefined()
    ext: CustomResolver<string>;

    @IsDefined()
    fileName: CustomResolver<string>;

    @IsOptional() 
    download: CustomResolver<boolean>;

    @IsOptional() 
    save: CustomResolver<boolean>;
    
    @IsOptional()
    object: CustomResolver<SmartObjectDto>;

    @IsOptional() 
    version: CustomResolver<SysFile>;
}
