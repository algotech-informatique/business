import { IsUUID, IsString } from 'class-validator';

// @dynamic
export class WorkflowTaskActionDeleteVersionDto {
    @IsUUID()
    smartObject: string;

    @IsString()
    versionID: string;
}
