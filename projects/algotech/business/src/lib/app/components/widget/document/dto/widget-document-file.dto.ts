import { DocumentDto, SmartObjectDto, SysFile, TagDto } from '@algotech/core';

export class WidgetDocumentFileDto extends SysFile {
    smartObject: SmartObjectDto;
    document?: DocumentDto;
    displayTags: TagDto[];
    checked?: boolean;
    hidden?: boolean;
    downloaded?: boolean;
}