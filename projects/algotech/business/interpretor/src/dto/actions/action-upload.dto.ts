import { IsDefined, IsUUID, ValidateNested, IsOptional } from 'class-validator';
import { FileUploadDto } from '@algotech-ce/core';
import { Type } from 'class-transformer';

// @dynamic
export class WorkflowTaskActionUploadDto {
    @IsOptional()
    @IsUUID()
    smartObject?: string;

    @IsDefined()
    fileName: string;

    @IsDefined()
    fileType: string;

    @IsDefined()
    file: string;

    @ValidateNested()
    @Type(() => FileUploadDto)
    info: FileUploadDto;
}
