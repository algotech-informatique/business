import { IsUUID, ValidateNested } from 'class-validator';
import { FileEditDto } from '@algotech-ce/core';
import { Type } from 'class-transformer';

// @dynamic
export class WorkflowTaskActionEditDocumentDto {
    @IsUUID()
    smartObject: string;

    @ValidateNested()
    @Type(() => FileEditDto)
    edit: FileEditDto;
}
