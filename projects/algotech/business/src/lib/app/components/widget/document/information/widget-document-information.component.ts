import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { WidgetDocumentFileDto } from '../dto/widget-document-file.dto';
import * as _ from 'lodash';
import { DocumentDto, SysFile, VersionDto } from '@algotech/core';
import { AuthService, DocumentsService, SettingsDataService, TranslateLangDtoService } from '@algotech/angular';
import { DocumentsMetaDatasSettingsDto } from '@algotech/core';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

interface Metadatas {
    key: string;
    metadata: string;
    value: string;
    editable: boolean;
    isProperty: boolean;
}

@Component({
    selector: 'at-widget-document-information',
    templateUrl: './widget-document-information.component.html',
    styleUrls: ['widget-document-information.component.scss'],
})
export class WidgetDocumentInformationComponent implements OnChanges {

    @Input() infoFile: WidgetDocumentFileDto;
    @Input() options;
    @Input() readonly = false;
    @Output() returnClick = new EventEmitter();
    @Output() openVersion = new EventEmitter();

    listMetadatas: Metadatas[] = [];
    infoVersions: SysFile[] = [];
    isCollapsedMetadata = true;
    isCollapsedVersions = true;

    optionsVersionVisible = true;

    constructor(
        private settingsDataService: SettingsDataService,
        private translateDtoService: TranslateLangDtoService,
        private translateService: TranslateService,
        private docService: DocumentsService,
        private authService: AuthService,
    ) { 
        
    }

    ngOnChanges() {

        this.optionsVersionVisible = (this.options?.oldVersions?.active && 
            _.intersection(this.options?.oldVersions?.groups, this.authService.localProfil.groups ).length > 0);

        const document$: Observable<DocumentDto> = this.infoFile.document ? of(this.infoFile?.document) : this.docService.get(this.infoFile.documentID);
        document$.pipe(
            map((doc: DocumentDto) => {
                this._createMetadata(doc);
                this._createVersions(doc);
            }),
        ).subscribe();
    }

    _createMetadata(doc: DocumentDto) {
        this.listMetadatas  = _.map(this.settingsDataService.settings.documents.metadatas, (datas: DocumentsMetaDatasSettingsDto)=> {
            const val = _.find(doc.metadatas, { key: datas.key });
            const data: Metadatas = {
                key: datas.key,
                metadata: this.translateDtoService.transform(datas.displayName),
                value: val ? val.value : '',
                editable: true,
                isProperty: false,
            };
            return data;
        });
    }

    _createVersions(doc: DocumentDto) {
        this.infoVersions.push(..._.map(doc.versions, (version: VersionDto) => {
            return this._loadDataVersion(doc, version);
        }));
    }

    _loadDataVersion(doc: DocumentDto, version: VersionDto): SysFile {

        const data: SysFile = {
            documentID: doc.uuid,
            dateUpdated: this._transformFileDate(version.dateUpdated),
            ext: doc.ext,
            metadatas: doc.metadatas,
            name: this._transformLongFileDate(version.dateUpdated),
            size: version.size,
            reason: version.reason,
            tags: doc.tags,
            user: version.userID,
            versionID: version.uuid   
        }
        return data;
    }

    _transformFileDate(date): string {
        return new Date(moment(date).format()).toLocaleDateString(this.translateService.currentLang);
    }

    _transformLongFileDate(date): string {
        return new Date(moment(date).format()).toLocaleDateString(this.translateService.currentLang) + ' '
            + new Date(moment(date).format()).toLocaleTimeString(this.translateService.currentLang);
    }

    onCollapseMetadata(event) {
        this.isCollapsedMetadata = !this.isCollapsedMetadata;
    }

    onCollapseVersions(event) {
        this.isCollapsedVersions = !this.isCollapsedVersions;
    }

    onReturnClick() {
        this.returnClick.emit();
    }

    onClickFile(file) {
        this.openVersion.emit(file);
    }
}