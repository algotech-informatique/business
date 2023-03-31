import { DocumentDto, SmartObjectDto, SysFile, TagDto } from '@algotech-ce/core';

export class WidgetDocumentFileDto extends SysFile {
    smartObject: SmartObjectDto;
    document?: DocumentDto;
    displayTags: TagDto[];
    checked?: boolean;
    hidden?: boolean;
    downloaded?: boolean;
}