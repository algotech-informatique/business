import {
    FileUploadDto, ReportGenerateDto, SmartObjectDto, ReportPreviewDto,
    SysFile, UserDto, WorkflowInstanceContextDto, PairDto, WorkflowVariableModelDto, FileUtils
} from '@algotech/core';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import { from, Observable, of, zip } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import jsZip from 'jszip';
        
export abstract class ReportsUtils {

    abstract previewReport(reportPreview: ReportPreviewDto, smartobjects: SmartObjectDto[],
        context: WorkflowInstanceContextDto): Observable<any>;
    abstract generateReport(reportGenerate: ReportGenerateDto, smartobjects: SmartObjectDto[],
        context: WorkflowInstanceContextDto): Observable<any>;
    abstract getFile(fileUuid: string, context: WorkflowInstanceContextDto): Observable<Blob>;
    abstract getFileB64(fileUuid: string, context: WorkflowInstanceContextDto): Observable<string>;
    abstract generateXReport(templateUuid: string, inputs: any[], fileName: string, ext: string,
        download: boolean, smartobjects: SmartObjectDto[], context: WorkflowInstanceContextDto): Observable<Blob>;
    abstract templaterParseData(file: any, inputs: any[], ext: string, smartobjects: SmartObjectDto[], context: WorkflowInstanceContextDto): Observable<any>;
    abstract getSysFileInputs(wfUuid: string, inputs: PairDto[], keysTypes: WorkflowVariableModelDto[],
        context: WorkflowInstanceContextDto): Observable<PairDto[]>;
    abstract convertFile(versionId: string, filename: string, open: boolean, context: WorkflowInstanceContextDto): Observable<Blob>;
    abstract openFileDocument(fileName: string, file: Blob);
    abstract createFile(content: any, fileName: string, type: string);
    abstract createTextFile(fileName: string, content: string, ext: string, download: boolean): Buffer|Blob;

    isImage(ext: string): boolean {
        const type = FileUtils.extToMimeType(ext);
        return type.startsWith('image/');
    }

    zip(versions: SysFile[], fileName: string, download: boolean, context: WorkflowInstanceContextDto): Observable<Blob> {
        return this.zipFiles(versions, context).pipe(
            mergeMap((files: {file: Blob, name: string}[]) => {
                return this.generateZip(fileName, files);
            }),
            map((file: Blob) => {
                if (download) {
                    this.openFileDocument(fileName, file);
                }
                return file;
            }),
        );
    }

    zipFiles(versions: SysFile[], context: WorkflowInstanceContextDto): Observable<{file: Blob, name: string}[]> {
        return (versions.length === 0) ? of([]) :
            zip(..._.map(versions,  (doc: SysFile) => {
                return this.createZipFile(doc.versionID, doc.name, context);
            })
        );
    }

    createZipFile(versionId: string, fileName: string, context: WorkflowInstanceContextDto): Observable<{file: Blob, name: string}> {
        return this.getFile(versionId, context).pipe(
            map((file: Blob) => {
                const zipFile: {file: Blob, name: string} = {
                    file,
                    name: fileName
                }
                return zipFile;
            }),
        );
    }

    generateZip(fileName: string, files: {file: Blob, name: string}[]): Observable<Blob> {
        return from(this._zipFile(fileName, files));
    }

    _zipFile(fileName: string, files: {file: Blob, name: string}[]): Promise<Blob> {
        const aZip = new jsZip;
        for (const file of files) {
            aZip.file(file.name, file.file);
        }

        return aZip.generateAsync({  type: 'arraybuffer' })
            .then((content) =>  {
                return this.createFile(content, fileName, 'application/zip');
        });
    }

    generateDataReport(version: SysFile, reportModel: string,
        so: SmartObjectDto, fileName: string, download: boolean, data: any[], user: UserDto): ReportGenerateDto {

        const fileUpload: FileUploadDto = {
            documentID: version ? version.documentID : UUID.UUID(),
            versionID: UUID.UUID(),
            userID: user.uuid,
            reason: '',
            tags: '', // todo tags on TaskEditor
            metadatas: '',
        };

        const reportGenerate: ReportGenerateDto = {
            reportKey: reportModel,
            soUuid: so.uuid,
            details: fileUpload,
            fileName: fileName,
            preview: false,
            download: download,
            data: this.transformData(data),
        };
        return reportGenerate;
    }

    previewDataReport(reportModel: string, fileName: string, download: boolean, data: any[]) {
        const reportPreview: ReportPreviewDto = {
            reportKey: reportModel,
            fileName: fileName,
            download: download,
            data: this.transformData(data),
        };
        return reportPreview;
    }

    transformData(data: any[]): any[] {
        return _.map(data, (d) => {

            if (d instanceof SmartObjectDto) {
                return {
                    uuidSmartObject: d.uuid, // save uuid
                };
            }

            if (Array.isArray(d) && d.length > 0 && d[0] instanceof SmartObjectDto) {
                return _.map(d, (item) => {
                    return {
                        uuidSmartObject: item.uuid, // save uuid
                    };
                });
            }
            return d;
        });
    }

    calculateData(inputs, smartobjects: SmartObjectDto[], jwt: string): any {
        const _inputs = _.cloneDeep(inputs);

        const _smartobjects = _.cloneDeep(smartobjects);

        this.nested(
            _inputs, _.uniqBy(_smartobjects, 'uuid')
        );

        _inputs.push({ jwt });
        return { data: _inputs };
    }

    nested(inputs: any[], smartobjects: SmartObjectDto[]) {
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (Array.isArray(input)) {
                for (let j = 0; j < input.length; j++) {
                    if (input[j]) {
                        const findSo = _.find(smartobjects, (so) => so.uuid === input[j].uuidSmartObject);
                        if (findSo) {
                            input[j] = findSo;
                        }
                    }
                }
            } else {
                const findSo = _.find(smartobjects, (so) => so.uuid === inputs[i].uuidSmartObject);
                if (findSo) {
                    inputs[i] = findSo;
                }
            }
        }
    }
}
