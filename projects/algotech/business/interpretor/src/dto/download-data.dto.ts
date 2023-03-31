import { WorkflowDataDto, DocumentDto, SmartObjectDto } from '@algotech-ce/core';

export class DownloadDataDto {
    datas: WorkflowDataDto[];
    smartObjects: SmartObjectDto[];
    documents: DocumentDto[];
    uuids?: string[];
}
