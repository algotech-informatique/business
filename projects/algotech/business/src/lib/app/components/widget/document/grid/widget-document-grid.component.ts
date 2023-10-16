import { Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { WidgetDocumentFileDto } from '../dto/widget-document-file.dto';
import * as _ from 'lodash';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { APP_BASE_HREF } from '@angular/common';

@Component({
    selector: 'widget-document-grid',
    templateUrl: './widget-document-grid.component.html',
    styleUrls: ['widget-document-grid.component.scss'],
})
export class WidgetDocumentGridComponent implements OnChanges {

    @Input() files: WidgetDocumentFileDto[];
    @Input() options: any;
    @Input() nbShowed: number;

    @Input() mobile = false;
    @Input() showInfo = true;
    @Input() mode: 'selection' | 'open' = 'open';

    @Output() openedFile = new EventEmitter<WidgetDocumentFileDto>();
    @Output() selectedDocument = new EventEmitter();
    @Output() selectInfo = new EventEmitter<WidgetDocumentFileDto>();
    search: string;

    defaultImage: string;

    constructor(
        private filesService: FilesService,
        @Inject(APP_BASE_HREF) public baseHref: string,
    ) {
        this.defaultImage = this.baseHref + 'assets/images/picture.png';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes?.files?.currentValue) {
            const filesFiltered: boolean = _.some(this.files, (file: WidgetDocumentFileDto) => file.hidden);
            if (filesFiltered) {
                _.sortBy(this.files, (file: WidgetDocumentFileDto) => file.name.toUpperCase());
            }
        }
    }

    openDocument($event: Event, file: WidgetDocumentFileDto) {
        $event.stopPropagation();
        this.openedFile.emit(file);
    }

    clickInfo($event: Event, file: WidgetDocumentFileDto) {
        $event.stopPropagation();
        this.selectInfo.emit(file);
    }

    clickFileItem(file: WidgetDocumentFileDto) {
        if (this.mode === 'open') {
            this.openedFile.emit(file);
        } else if (!file.lock || file.lock.status === 'byMe') {
            file.checked = !file.checked;
            this.selectedDocument.emit();
        }
    }

    onSrcError(file: WidgetDocumentFileDto, image: HTMLImageElement) {
        const url = this.filesService.getURL(file.versionID, true, true);
        if (image.srcset === url) {
            image.srcset = '';
            return;
        }
        image.srcset = this.filesService.getURL(file.versionID, true, true);
    }
}
