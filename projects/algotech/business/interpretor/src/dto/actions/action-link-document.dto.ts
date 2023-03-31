import { IsUUID, ValidateNested } from 'class-validator';
import { FileUploadDto } from '@algotech-ce/core';
import { Type } from 'class-transformer';

// @dynamic
export class WorkflowTaskActionLinkDocumentDto {
    @IsUUID()
    smartObject: string;

    @ValidateNested()
    @Type(() => FileUploadDto)
    info: FileUploadDto;
}
