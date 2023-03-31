import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../custom-resolver.type';
import { SmartObjectDto, SysFile } from '@algotech-ce/core';

export class TaskDocumentFileZipDto {

    @IsDefined() 
    documents: CustomResolver< SmartObjectDto | SmartObjectDto[] | SysFile | SysFile[]>

    @IsDefined()
    fileName: CustomResolver<string>;

    @IsOptional() 
    download: CustomResolver<boolean>;

    @IsOptional() 
    save: CustomResolver<boolean>;
    
    @IsOptional()
    object: CustomResolver<SmartObjectDto>;

    @IsOptional() 
    version: CustomResolver<boolean>;
}
