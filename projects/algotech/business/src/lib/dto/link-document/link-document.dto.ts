import { SmartObjectDto, DocumentDto, SysFile } from '@algotech/core';
import { LinkDocumentDisplay } from './link-document-display.dto';
import { LinkDocumentObject } from './link-document-object.dto';

export class LinkDocument {
    uuid: string;
    display:  LinkDocumentDisplay;
    file: DocumentDto | SysFile;
    smartObjects?: SmartObjectDto[];
    linkedObjects?: LinkDocumentObject[];
    deletable?: boolean;
    checked?: boolean;
}