import { SettingsDataService } from '@algotech-ce/angular';
import { SnPageWidgetDto, ApplicationModelDto, SmartObjectDto, TagListDto, TagDto } from '@algotech-ce/core';
import { Component, EventEmitter, Inject } from '@angular/core';
import { EventData } from '../../../models';
import { Widget } from '../widget.interface';
import * as _ from 'lodash';
import { WidgetDocumentFileDto } from '../document/dto/widget-document-file.dto';
import { FilesService } from '../../../../workflow-interpretor/@utils/files.service';
import { WidgetImageService } from '../services/widget-image.service';
import { APP_BASE_HREF } from '@angular/common';

@Component({
    selector: 'widget-image',
    templateUrl: './widget-image.component.html',
    styleUrls: ['widget-image.component.scss'],
})
export class WidgetImageComponent implements Widget {

    appModel: ApplicationModelDto;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();

    // custom params
    typeSrc: 'file' | 'uri' | 'datasource';
    srcExists = false;

    imageFile: any;
    defaultImage: string;
    tags: TagDto[];

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    constructor(
        private widgetImageService: WidgetImageService,
        private settingsDataService: SettingsDataService,
        private filesService: FilesService,
        @Inject(APP_BASE_HREF) public baseHref: string,
    ) {
        this.tags = _.flatten(_.map(this.settingsDataService.tags, (tagList: TagListDto) => tagList.tags));
        this.defaultImage = this.baseHref + 'assets/images/picture.png'
    }

    onImgError(event) {
        event.target.src = this.baseHref + 'assets/images/loading.gif'
    }

    onChanged() {
        this.initialize();
    }

    initialize() {
        this.typeSrc = this._widget.custom?.typeSrc;

        switch (this.typeSrc) {
            case 'file':
                this.srcExists = (this.widget.custom?.imageUuid)
                this.imageFile = this.widget.custom?.imageUuid;
                break;
            case 'uri':
                this.srcExists = (this.widget.custom?.imageUri);
                this.imageFile = this.widget.custom?.imageUri;
                break;
            case 'datasource':
                this._getDataSource(this._widget.custom?.tag);
                break;
            default:
                this.imageFile = this.baseHref + 'assets/images/picture.png'
                this.srcExists = false;
        }
    }

    _getDataSource(tag: string) {

        const input = this._widget.custom.input;
        const documents = this._widget?.custom?.__documents ? this._widget?.custom?.__documents : [];
        this.srcExists = false;
        if (!input || input === '--') {
            return;
        }

        if (Array.isArray(input) && input.length === 0) {
            return;
        }

        const type: 'so' | 'file' = ((Array.isArray(input) && input[0] instanceof SmartObjectDto) || input instanceof SmartObjectDto) ?
            'so' : 'file';
        if (type === 'so') {
            if (!tag) {
                return;
            }

            this.widgetImageService.getSmartObjectFiles(input, documents, this.tags).subscribe(
                (files: WidgetDocumentFileDto[]) => {
                    this.imageFile = this._filterByTags(tag, files);
                    this.srcExists = (this.imageFile);
                });
        } else {
            this.widgetImageService.getSysFile(input, this.tags).subscribe(
                (files: WidgetDocumentFileDto[]) => {
                    this.imageFile = this._validateIsImage(files);
                    this.srcExists = (this.imageFile);
                });
        }
    }

    _filterByTags(tag: string, files: WidgetDocumentFileDto[]): WidgetDocumentFileDto {

        const selectedFiles: WidgetDocumentFileDto[] = _.reduce(files, (result, file: WidgetDocumentFileDto) => {
            if (this.filesService.isImage(file.ext) && file.tags.includes(tag)) {
                result.push(file)
            }
            return result;
        }, []);
        return (selectedFiles.length !== 0) ? selectedFiles[0] : null;
    }

    _validateIsImage(files: WidgetDocumentFileDto[]): WidgetDocumentFileDto {
        const selectedFiles: WidgetDocumentFileDto[] = _.reduce(files, (result, file: WidgetDocumentFileDto) => {
            if (this.filesService.isImage(file.ext)) {
                result.push(file)
            }
            return result;
        }, []);
        return (selectedFiles.length !== 0) ? selectedFiles[0] : null;
    }

    onClick(UIEvent: Event) {
        this.event.emit({ key: 'onClick', UIEvent });
    }

}
