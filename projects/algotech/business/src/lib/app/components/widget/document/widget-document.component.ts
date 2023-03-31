import { SnPageWidgetDto, ApplicationModelDto, SmartObjectDto, TagDto, TagListDto, PairDto } from '@algotech-ce/core';
import { Component, EventEmitter } from '@angular/core';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';
import { WorkflowLaunchService } from '../../../../workflow-launcher/workflow-layout.lancher.service';
import { EventData, PageData } from '../../../models';
import { Widget } from '../widget.interface';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { DataService, SettingsDataService, SmartObjectsService } from '@algotech-ce/angular';
import { WidgetDocumentFileDto } from './dto/widget-document-file.dto';
import { FilesService } from '../../../../workflow-interpretor/@utils/files.service';
import { FileAssetDto } from '../../../../dto/file-asset.dto';
import { WidgetImageService } from '../services/widget-image.service';

@Component({
    selector: 'widget-document',
    templateUrl: './widget-document.component.html',
    styleUrls: ['widget-document.component.scss'],
})
export class WidgetDocumentComponent implements Widget {

    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    readonly: boolean;
    item: PageData;
    event = new EventEmitter<EventData>();

    files: WidgetDocumentFileDto[];
    tags: TagDto[];
    hasWorkflows: boolean;

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    constructor(
        private smartObjectsService: SmartObjectsService,
        private soUtils: SoUtilsService,
        private workflowLaucher: WorkflowLaunchService,
        private settingsDataService: SettingsDataService,
        private filesService: FilesService,
        public dataService: DataService,
        private widgetImageService: WidgetImageService,
    ) {
        this.tags = _.flatten(_.map(this.settingsDataService.tags, (tagList: TagListDto) => tagList.tags));
    }

    initialize() {
        const input = this._widget?.custom?.input;
        const documents = this._widget?.custom?.__documents ? this._widget?.custom?.__documents : [];
        if (!input || input === '--') {
            return;
        }

        if (Array.isArray(input) && input.length === 0) {
            return;
        }

        const type: 'so' | 'file' = ((Array.isArray(input) && input[0] instanceof SmartObjectDto) || input instanceof SmartObjectDto) ?
            'so' : 'file';

        if (type === 'so') {
            this.widgetImageService.getSmartObjectFiles(input, documents, this.tags).subscribe(
                (files: WidgetDocumentFileDto[]) => {
                    this.files = files;
                    this.hasActionDocument();
            });
        } else {
            this.widgetImageService.getSysFile(input, this.tags).subscribe(
                (files: WidgetDocumentFileDto[]) => {
                    this.files = files;
                    this.hasActionDocument;
            }); 
        }
    }

    hasActionDocument() {
        const ev = this.widget.events.find((e) => e.eventKey.toLowerCase() === 'onactiondocument');
        this.hasWorkflows = ev?.pipe?.length > 0;
    }

    onChanged() {
        this.initialize();
    }

    onLaunch(event: { UIEvent, files: WidgetDocumentFileDto[] }) {
        const smartObjects = _.uniq(_.compact(event.files.map((d) => d.smartObject)), 'uuid');

        this.workflowLaucher.setSourceValue('smart-object-selected', null);
        this.workflowLaucher.setSourceValue('documents-selected', null);
        this.workflowLaucher.setSourceValue('document-selected', null);

        if (smartObjects.length === 1) {
            this.workflowLaucher.setAdditional('smart-object', smartObjects[0]);
            this.workflowLaucher.setAdditional('smart-model', this.soUtils.getModel(smartObjects[0].modelKey));
            this.workflowLaucher.setSourceValue('smart-object-selected', smartObjects[0].uuid);
        }

        if (event.files.length > 0) {
            this.workflowLaucher.setSourceValue('documents-selected', event.files.map((file) => {
                return this.toSysFile(file);
            }));
            if (event.files.length === 1) {
                this.workflowLaucher.setSourceValue('document-selected', this.toSysFile(event.files[0]));
            }
        }

        this.event.emit({ key: 'onActionDocument', UIEvent: event.UIEvent });
    }

    onOpenFile(file: WidgetDocumentFileDto) {
        if (!this.dataService.mobile) {
            this.smartObjectsService.downloadFile(file.versionID, true, false);
            return ;
        }
        this.filesService.getAsset(file.versionID).subscribe((asset: FileAssetDto) => {

            const obsDownload = !asset ? this.filesService.downloadDocument(this.toSysFile(file), false) : of(asset);
            obsDownload.subscribe((asset: FileAssetDto) => {
                file.downloaded = true;
                if (asset.file) {
                    this.filesService.openDocument(asset.file, asset.infoFile.name);
                }
            });
        });
    }

    private toSysFile(file: WidgetDocumentFileDto) {
        const res = _.cloneDeep(file);
        delete res.smartObject;
        delete res.document;
        delete res.checked;
        delete res.hidden;
        delete res.displayTags;
        delete res.downloaded;

        return res;
    }
}
