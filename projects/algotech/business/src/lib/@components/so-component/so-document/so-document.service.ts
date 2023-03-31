import { Injectable } from '@angular/core';
import { SmartObjectsService, DocumentIconDtoService, DocumentsService, GestionDisplaySettingsService } from '@algotech-ce/angular';
import { QuerySearchDto, QuerySearchResultDto, DocumentDto, DocumentIconDto, SettingsDto, SmartObjectDto } from '@algotech-ce/core';
import { Observable, of, zip, Subject } from 'rxjs';
import { mergeMap, catchError, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { LinkDocumentObject } from '../../../dto/link-document/link-document-object.dto';
import { LinkDocument } from '../../../dto/link-document/link-document.dto';
import { LinkDocumentDisplay } from '../../../dto/link-document/link-document-display.dto';

@Injectable()
export class DocSOFilesService {

    constructor(
        private readonly smartObjectsService: SmartObjectsService,
        private readonly docIconService: DocumentIconDtoService,
        private readonly documentsService: DocumentsService,
        private gestionDisplaySettings: GestionDisplaySettingsService,
    ) { }

    searchDocuments$(query: QuerySearchDto, resultsSkip: number, resultsLimit: number): Observable<LinkDocument[]> {
        return this.smartObjectsService.querySearch(query, resultsSkip, resultsLimit, 'file:').pipe(
            mergeMap((res: QuerySearchResultDto[]) => {
                if ((!res || !res[0]) || (!res[0].header || res[0].header.type !== 'file')
                    || (!res[0].values || res[0].values.length === 0)) { return of([]); }
                const docsId: string[] = _.map(res[0].values, (r) => r._id);
                const getDocuments$: Observable<DocumentDto>[] = _.map(docsId, (id: string) => {
                    return this.documentsService.get(id).pipe(catchError(() => of([])));
                });
                return getDocuments$.length === 0 ? of([]) : zip(...getDocuments$);
            }),
            mergeMap((docs: DocumentDto[]) => {
                return this.getDocsSmartObjects$(docs);
            }),
        );
    }

    getDocsSmartObjects$(documents: DocumentDto[]): Observable<LinkDocument[]> {
        if (!documents || documents.length === 0) { return of([]); }
        const getSOs$: Observable<SmartObjectDto[]>[] = _.map(documents, (doc: DocumentDto) => {
            return this.smartObjectsService.getSmartObjectsByDocument(doc.uuid);
        });
        return getSOs$.length === 0 ? of([]) : zip(...getSOs$).pipe(
            mergeMap((smartObjects: SmartObjectDto[][]) => {
                if (!smartObjects) { return; }
                const docDispl: Observable<LinkDocument>[] = _.map(documents, (doc: DocumentDto, index: number ) => {
                    return this.displayDocuments(doc, smartObjects[index]);
                });
                return docDispl.length === 0 ? of([]) : zip(...docDispl);
            })
        );
    }

    displayDocuments(doc: DocumentDto, smartObjects: SmartObjectDto[]): Observable<LinkDocument> {
        return this.formatSO(smartObjects).pipe(
            map((linkSO: LinkDocumentObject[]) => {
                const docIcon: DocumentIconDto = this.docIconService.getDocumentIcon(doc.ext);
                const display: LinkDocumentDisplay = {
                    primary: doc.name,
                    color: docIcon.color,
                    icon: docIcon.icon,
                };
                const docD: LinkDocument  = {
                    uuid: doc.uuid,
                    display: display,
                    file: doc,
                    smartObjects: smartObjects,
                    linkedObjects: linkSO,
                    checked: false,
                    deletable: false,
                };
                return docD;
            })
        );
    }

    formatSO(smartObjects: SmartObjectDto[]): Observable<LinkDocumentObject[]> {
        const obsDisplay: Observable<LinkDocumentObject>[] = _.map(smartObjects, (so: SmartObjectDto) => {
            return this.displaySmartObject(so);
        });
        return obsDisplay.length === 0 ? of([]) : zip(...obsDisplay);
    }

    displaySmartObject(so: SmartObjectDto): Observable<LinkDocumentObject> {
        return zip(
            this.gestionDisplaySettings.validateNameFromSettings(so, 'primary'),
            this.gestionDisplaySettings.validateNameFromSettings(so, 'secondary'),
        ).pipe(
            map((display: string[]) => {
                const soDisp: LinkDocumentObject = {
                    uuid: so.uuid,
                    primary: display[0],
                    secondary: display[1]
                };
            return soDisp;
            })
        );
    }

}
