import { TranslateService } from '@ngx-translate/core';
import { DocumentIconDtoService } from '@algotech-ce/angular';
import { DocumentIconDto, SysFile, DocumentDto } from '@algotech-ce/core';
import { Component, Input, Output, SimpleChanges, EventEmitter, OnChanges } from '@angular/core';
import * as _ from 'lodash';

@Component({
    selector: 'at-file-component',
    styleUrls: ['./file.component.scss'],
    template: `
        <div class="file-preview" [ngClass]="{'framed': framed}">
            <div *ngIf="icon?.icon"
                [innerHTML]="icon.icon"
                [ngStyle]="{color: icon.color}"
                class="icon">
            </div>
            <div class="info">
                <div class="title" [title]="file?.name">{{ file?.name }}</div>
                <div class="size">{{ size }}</div>
            </div>
            <i *ngIf="removable" class="fa-solid fa-trash rm button" (click)="removeDocument()"></i>
            <i *ngIf="clickable" class="fa-solid fa-eye view button" (click)="clickDocument()"></i>
        </div>
  `
})
export class FileComponent implements OnChanges {

    @Input() file: File | SysFile | DocumentDto;
    @Input() framed = false;
    @Input() removable = false;
    @Input() clickable = false;
    @Output() removeFile = new EventEmitter();
    @Output() clickFile = new EventEmitter();

    size: string;
    icon: DocumentIconDto;

    constructor(
        private documentIconService: DocumentIconDtoService,
        private translate: TranslateService,
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.file?.currentValue) {
            this.icon = this.documentIconService.getDocumentIcon(this.file.name.split('.').pop());
            this.size = this._formatBytes((this.file as any).size ?
                (this.file as any).size : (this.file as any).versions ?
                    (this.file as any).versions[0].size : null
            );
        }
    }

    removeDocument() {
        this.removeFile.emit();
    }

    clickDocument() {
        this.clickFile.emit();
    }

    private _formatBytes(bytes): string {
        if (!bytes) {
            return null
        } else if (bytes < 1000) {
            return `${bytes} ${this.translate.instant('DOCUMENTS.SIZE_UNIT.BYTE')}`;
        } else if (bytes < 1000000) {
            return `${(bytes / 1000).toFixed(1)} ${this.translate.instant('DOCUMENTS.SIZE_UNIT.KB')}`;
        } else if (bytes < 1000000000) {
            return `${(bytes / 1000000).toFixed(1)} ${this.translate.instant('DOCUMENTS.SIZE_UNIT.MB')}`;
        } else {
            return `${(bytes / 1000000000).toFixed(1)} ${this.translate.instant('DOCUMENTS.SIZE_UNIT.GB')}`;
        }
    }

}
