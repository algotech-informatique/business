import { DocumentDto, SmartObjectDto, SysFile, TagDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import { FilesService } from '../../../../workflow-interpretor/@utils/files.service';
import * as _ from 'lodash';
import { WidgetDocumentFileDto } from '../document/dto/widget-document-file.dto';
import { FileAssetDto } from '../../../../dto/file-asset.dto';
import { Observable, of, zip } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { SmartObjectsService } from '@algotech/angular';
import { SoUtilsService } from '../../../../workflow-interpretor/@utils/so-utils.service';
import { SysUtilsService } from '../../../../workflow-interpretor/@utils/sys-utils.service';
import { PageEventsService } from '../../../services/page-events.service';

@Injectable()
export class WidgetImageService {

    constructor(
        private filesService: FilesService,
        private smartObjectsService: SmartObjectsService,
        private soUtils: SoUtilsService,
        private sysUtils: SysUtilsService,
        private pageEvents: PageEventsService,
    ) {}

    getSmartObjectFiles(input: any, documents: any, tags: TagDto[]) : Observable<WidgetDocumentFileDto[]> {

        const smartObjects = <SmartObjectDto[]>((Array.isArray(input) ? input : [input]));
        const display$ = smartObjects.map((smartObject) => {
            const soDocuments = this.soUtils.getDocuments(smartObject, documents);
            const soDocuments$ = soDocuments.length !== smartObject.skills.atDocument.documents.length ?
                this.smartObjectsService.getDocuments(smartObject).pipe(map((res) => {
                    // lazy loading
                    this.pageEvents.pushDocuments(res);
                    return res;
                })) : of(soDocuments);

            return soDocuments$.pipe(
                mergeMap((documents: DocumentDto[]) => {
                    const ids = documents.map((d) => d.versions[0].uuid);
                    return this.filesService.getAssets(ids).pipe(
                        map((assets) => {
                            return {
                                documents,
                                assets
                            };
                        })
                    )
                }),
                map((res) => {
                    return res.documents.map((document) => {
                        const sysFile: SysFile = this.sysUtils.transform(document, 'sys:file');
                        return Object.assign(sysFile, {
                            smartObject,
                            document,
                            displayTags: this._getDisplayTags(tags, document.tags),
                            downloaded: res.assets.some((a) => a.infoFile.versionID === sysFile.versionID),
                        });
                    });
                }),
            );
        });
        return (display$.length === 0) ? of ([]) : zip(...display$).pipe(
            map((fls) => {
                return _.flatten(fls);
            }),
        );
    }

    getSysFile(input: any, tags: TagDto[]): Observable<WidgetDocumentFileDto[]> {

        const ids = (Array.isArray(input) ? input : [input]).map((f: SysFile) => f.versionID);
        const file$: Observable<WidgetDocumentFileDto[]> = this.filesService.getAssets(ids).pipe(
            map((assets: FileAssetDto[]) => {
                const files: WidgetDocumentFileDto[] = [];
                files.push(...(Array.isArray(input) ?
                input.map((file: SysFile) => {
                    Object.assign(file, { 
                        displayTags: this._getDisplayTags(tags, file.tags),
                        downloaded: assets.some((a) => a.infoFile.versionID === file.versionID),
                    })
                    return file;
                })
                :
                [Object.assign(input, {
                    displayTags: this._getDisplayTags(tags, input.tags),
                    downloaded: assets.some((a) => a.infoFile.versionID === input.versionID),
                })])
            );
            return files;

        }));
        return file$;
    }
    
    _getDisplayTags(tags: TagDto[], fileTags: string[]) {
        const displayTags: TagDto[] = _.reduce(fileTags, (res: TagDto[], tagKey: string) => {
            const tag: TagDto = _.find(tags, (tag: TagDto) =>
                tag.key === tagKey);
            if (tag) { res.push(tag); }
            return res;
        }, []);
        return displayTags;
    }
    
}
