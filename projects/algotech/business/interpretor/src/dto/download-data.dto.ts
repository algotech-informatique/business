import { WorkflowDataDto, DocumentDto, SmartObjectDto } from '@algotech/core';

export class DownloadDataDto {
    datas: WorkflowDataDto[];
    smartObjects: SmartObjectDto[];
    documents: DocumentDto[];
    uuids?: string[];
}
