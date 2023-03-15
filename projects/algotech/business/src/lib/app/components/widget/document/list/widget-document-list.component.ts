import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { WidgetDocumentFileDto } from '../dto/widget-document-file.dto';
import * as _ from 'lodash';

@Component({
    selector: 'widget-document-list',
    templateUrl: './widget-document-list.component.html',
    styleUrls: ['widget-document-list.component.scss'],
})
export class WidgetDocumentListComponent implements OnChanges {

    @Input() files: WidgetDocumentFileDto[];
    @Input() options: any;
    @Input() nbShowed: number;

    @Input() mobile = false;
    @Input() showInfo = true;
    @Input() mode: 'selection' | 'open' = 'open';

    @Output() openedFile = new EventEmitter<WidgetDocumentFileDto>();
    @Output() infoClick = new  EventEmitter<WidgetDocumentFileDto>();
    @Output() selectedDocument = new EventEmitter();
    @Output() selectInfo = new EventEmitter<WidgetDocumentFileDto>();
    @Output() launched = new EventEmitter<{ UIEvent: Event, files: WidgetDocumentFileDto[] }>();
    @Output() openMore = new EventEmitter<{ UIEvent: Event, file: WidgetDocumentFileDto }>();

    search: string;

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
        if (this.mode === 'selection' && this.mobile) {
            this.selectDocument(file);
        } else {
            this.openedFile.emit(file);
        }
    }

    clickInfo(event: Event, file: WidgetDocumentFileDto) {
        event.stopPropagation();
        this.selectInfo.emit(file);
    }

    clickMore(UIEvent: Event, file: WidgetDocumentFileDto) {
        this.openMore.emit({UIEvent, file});
    }
    
    clickFileItem(file: WidgetDocumentFileDto) {
        if (this.mode === 'open') {
            this.openedFile.emit(file);
        } else {
            this.selectDocument(file);
        }
    }

    openFileInfo(file) {
        this.infoClick.emit(file);
    }
    private selectDocument(file: WidgetDocumentFileDto) {
        file.checked = !file.checked;
        this.selectedDocument.emit();
    }
    
}
