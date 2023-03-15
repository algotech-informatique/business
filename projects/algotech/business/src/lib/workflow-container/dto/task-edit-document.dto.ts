import { IsDefined, IsOptional } from 'class-validator';
import { CustomResolver } from '../../../../interpretor/src/dto';
import { SysFile } from '@algotech/core';
import { SmartObjectDto } from '@algotech/core';

export class TaskEditDocumentDto {
    @IsDefined()
    objectLinked: CustomResolver<SmartObjectDto>;

    @IsDefined()
    document: CustomResolver<SysFile>;

    @IsOptional()
    activeTag?: CustomResolver<boolean>;

    @IsOptional()
    activeMetadata?: CustomResolver<boolean>;

    @IsOptional()
    modelsTag?: CustomResolver<string[]>;
}
