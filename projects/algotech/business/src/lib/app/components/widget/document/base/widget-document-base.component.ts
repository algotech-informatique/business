import { AuthService } from '@algotech/angular';
import { TagDto } from '@algotech/core';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { from, Observable, zip } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { FilterTag } from '../dto/filter-tag.dto';
import { WidgetDocumentFileDto } from '../dto/widget-document-file.dto';
import { UnhiddenFilesPipe } from '../pipes/unhidden-files.pipe';

@Component({
    selector: 'widget-document-base',
    templateUrl: './widget-document-base.component.html',
    styleUrls: ['widget-document-base.component.scss'],
})
export class WidgetDocumentBaseComponent implements OnChanges {

    @Input() files: WidgetDocumentFileDto[];
    @Input() options: any;
    @Input() mobile = false;
    @Input() hasWorkflows = true;
    @Input() readonly = false;

    @Output() launched = new EventEmitter<{ UIEvent: Event, files: WidgetDocumentFileDto[] }>();
    @Output() openedFile = new EventEmitter<WidgetDocumentFileDto>();

    mode: 'selection' | 'open' = 'open';
    showInfo = false;
    nbShowed: number;
    search: string;
    allowLaunch = false;
    filterTags: FilterTag[];
    allTagChecked = true;
    showFilterTags = false;
    title = 'WIDGET.DOCUMENT.TITLE';

    infoFile: WidgetDocumentFileDto = null;

    constructor(
        private filesService: FilesService,
        private unhiddenFilesPipe: UnhiddenFilesPipe,
        private authService: AuthService,
        private actionSheetController: ActionSheetController,
        private translateService: TranslateService,
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes?.files?.currentValue) {
            this.setNbShowed();
            this.filterTags = this.buildFilterTags(this.files);
            this.allowLaunch = this.files.some((file: WidgetDocumentFileDto) => file.checked);
        }

        if (changes?.options?.currentValue) {
            if (this.options.type.length === 0) {
                return ;
            }
            if (_.isEqual(this.options.type, ['documents'])) {
                this.title = 'WIDGET.DOCUMENT.TITLE';
            } else if (_.isEqual(this.options.type, ['images'])) {
                this.title = 'WIDGET.IMAGE.TITLE';
            } else {
                this.title = 'WIDGET.DOCUMENT_IMAGE.TITLE';
            }
        }

        this.mode = this.mobile || !this.hasWorkflows ? 'open' : 'selection';
        this.showInfo = (this.options?.metadatas || (this.options?.oldVersions?.active && 
            _.intersection(this.options?.oldVersions?.groups, this.authService.localProfil.groups ).length > 0));
        this.filterFiles();
    }

    onSelectedDocument() {
        if (this.mobile && this.mode === 'open') {
            this.launched.emit({ UIEvent: null, files: this.files.filter((f) => f.checked)});
        } else {
            this.allowLaunch = this.files.some((file: WidgetDocumentFileDto) => file.checked);
        }
    }

    onLaunch(UIEvent: Event) {
        this.launched.emit({ UIEvent, files: this.files.filter((f) => f.checked)});
    }

    onLaunchFileActions(ev: { UIEvent: Event, files: WidgetDocumentFileDto[] }) {
        this.launched.emit(ev);
    }

    onOpenFile(file: WidgetDocumentFileDto) {
        this.openedFile.emit(file);
    }

    onOpenFileWithId(id: string) {
        const file = this.files.find((f) => f.versionID === id);
        if (!file) {
            return;
        }
        this.openedFile.emit(file);
    }

    onInfoClick(file: WidgetDocumentFileDto) {
        this.infoFile = file;
    }

    toggleMode() {
        this.mode = this.mode === 'open' ? 'selection' : 'open';
        if (this.mode === 'open') {
            this.files = _.map(this.files, (file: WidgetDocumentFileDto) => {
                file.checked = false;
                return file;
            });
            this.allowLaunch = false;
        }
    }

    onOpenSingleMore(ev: { UIEvent: Event, file: WidgetDocumentFileDto }) {
        ev?.UIEvent?.stopPropagation();
        this.showActionSheet(ev.UIEvent, [ev.file]);
    }

    openMultiMore(UIEvent: Event) {
        const checkedFiles: WidgetDocumentFileDto[] = _.filter(this.files, (file: WidgetDocumentFileDto) => file.checked);
        this.showActionSheet(UIEvent, checkedFiles);
    }

    onReturnClick() {
        this.infoFile = null;
    }

    onSearch() {
        this.filterFiles();
    }

    resetSearch() {
        this.search = '';
        this.filterFiles();
    }

    toggleTagFilter() {
        this.showFilterTags = !this.showFilterTags;
        if (!this.showFilterTags) {
            this.filterTags = _.map(this.filterTags, (filterTag: FilterTag) => {
                filterTag.checked = true;
                return filterTag;
            });
        }
        this.filterFiles();
    }

    toggleTag(filterTag: FilterTag) {
        filterTag.checked = !filterTag.checked;
        this.filterFiles();
    }

    loadMore() {
        this.nbShowed = this.nbShowed + this.options?.pagination;
    }

    private buildFilterTags(files: WidgetDocumentFileDto[]): FilterTag[] {
        const tags: TagDto[] = _.reduce(files, (res: TagDto[], file: WidgetDocumentFileDto) => {
            res = _.uniq(res.concat(file.displayTags));
            return res;
        }, []);
        return _.map(tags, (t: TagDto) => ({ checked: true, tag: t }));
    }

    private filterFiles() {
        const requiredTags: TagDto[] = _.reduce(this.filterTags, (res: TagDto[], t: FilterTag) => {
            if (t.checked) { res.push(t.tag); }
            return res;
        }, []);
        this.files = _.map(this.files, (file: WidgetDocumentFileDto) => {
            const filteredByTag = !this.showFilterTags ? true : _.intersection(file.displayTags, requiredTags).length > 0;
            const filteredByInput = this.search?.length > 0 ? file.name.toLowerCase().includes(this.search.toLowerCase()) : true;
            const filteredByType = (this.options.type?.includes('images') && this.filesService.isImage(file.ext)) ||
                (this.options.type?.includes('documents') && !this.filesService.isImage(file.ext));

            file.hidden = !filteredByTag || !filteredByInput || !filteredByType;
            return file;
        });
        this.setNbShowed();
    }

    private setNbShowed() {
        this.nbShowed = this.options?.pagination || this.unhiddenFilesPipe.transform(this.files)?.length;
    }

    private showActionSheet(UIEvent: Event, files: WidgetDocumentFileDto[]) {
        const buttons = [{
            text: this.translateService.instant('WIDGET.DOCUMENT.ACTIONS'),
            icon: 'play',
            handler: () => this.launched.emit({ UIEvent: UIEvent, files: files}),
        }];

        if (files.length === 1) {
            const text: string = this.options?.oldVersions?.active && this.options?.metadatas ?
                this.translateService.instant('WIDGET.DOCUMENT.HISTORY-METADATA') :
                this.options?.oldVersions?.active ?
                    this.translateService.instant('WIDGET.DOCUMENT.HISTORY') :
                    this.options?.metadatas ?
                        this.translateService.instant('WIDGET.DOCUMENT.METADATA') :
                        null;
            if (text) {
                buttons.unshift({
                    text,
                    icon: 'information-circle',
                    handler: () => this.onInfoClick(files[0]),
                });
            }
        }

        if (!_.some(files, (file: WidgetDocumentFileDto) => !file.downloaded)) {
            buttons.push({
                text: this.translateService.instant('WIDGET.DOCUMENT.REMOVE-STORAGE'),
                icon: 'trash',
                handler: () => {
                    const removeAssets$: Observable<any>[] = _.map(files, (file: WidgetDocumentFileDto) =>
                        this.filesService.removeAsset(file.versionID)
                    );
                    zip(...removeAssets$).subscribe(() => {
                        files = _.map(files, (file: WidgetDocumentFileDto) => {
                            file.downloaded = false;
                            return file;
                        })
                    });
                },
            });
        }

        const header: string = files.length === 1 ?
            files[0].name :
            this.translateService.instant('WIDGET.DOCUMENT.SELECTED', {total: files.length});
        from(this.actionSheetController.create({
            header,
            buttons,
        })).pipe(
            mergeMap((actionSheet) => actionSheet.present()),
        ).subscribe();
    }

}
