import { IsUUID, IsArray } from 'class-validator';

// @dynamic
export class WorkflowTaskActionDeleteDocumentsDto {
    @IsUUID()
    smartObject: string;

    @IsArray()
    documentsID: string[];
}
