import { DocumentDto, SmartObjectDto, SysFile, TagDto } from '@algotech-ce/core';

export class WidgetDocumentFileDto extends SysFile {
    smartObject: SmartObjectDto;
    document?: DocumentDto;
    lock?: {
        caption: string,
        status: 'byMe' | 'byOtherOne',
    };
    displayTags: TagDto[];
    checked?: boolean;
    hidden?: boolean;
    downloaded?: boolean;
}