import {
    ReportGenerateDto, SmartObjectDto, ReportPreviewDto,
    WorkflowInstanceContextDto, SysFile, WorkflowVariableModelDto, PairDto, FileUtils,
} from '@algotech/core';
import { ConvertService, NetworkService, ReportsService } from '@algotech/angular';
import * as _ from 'lodash';
import { Observable, from, of, zip, throwError } from 'rxjs';
import { map, finalize, catchError, mergeMap } from 'rxjs/operators';
import { Injectable, NgZone } from '@angular/core';
import { FilesService } from '../../workflow-interpretor/@utils/files.service';
import { TranslateService } from '@ngx-translate/core';
import { ReportsUtils } from '../../../../interpretor/src';
import { TaskConvertError, TaskReportCreateError } from '../../../../interpretor/src/error/tasks-error';
import { FileAssetDto } from '../../dto/file-asset.dto';
import { WorkflowSoService } from '../../workflow-interpretor/workflow-reader/workflow-so/workflow-so.service';
import { SoUtilsService } from './so-utils.service';
import { WorkflowDialogService } from '../../workflow-dialog/workflow-dialog.service';
import { WorkflowDialogLoad } from '../../workflow-dialog/interfaces';
import { ToastController } from '@ionic/angular';
import { TaskUtilsService } from './task-utils.service';
import PizZip from 'pizzip';
import Templater from 'docxtemplater';
import expressions from 'angular-expressions';
import { DocxTemplaterModulesService } from './docx-templater-modules.service';

@Injectable()
export class ReportsUtilsService extends ReportsUtils {

    constructor(
        private reportService: ReportsService,
        private translate: TranslateService,
        private fileService: FilesService,
        private toastController: ToastController,
        protected soUtilsService: SoUtilsService,
        protected workflowSoService: WorkflowSoService,
        protected convertService: ConvertService,
        private zone: NgZone,
        private workflowDialog: WorkflowDialogService,
        private network: NetworkService,
        private taskUtils: TaskUtilsService,
        private docxTemplaterModules: DocxTemplaterModulesService,
    ) {
        super();
    }

    createTextFile(fileName: string, content: string, ext: string, download: boolean): File {
        const type = FileUtils.extToMimeType(ext);
        const file = this.isImage(ext) ? this.fileService._decodeB64(content, fileName, type) :
            this.createFile([content], fileName, type);
        if (download) {
            this.openFileDocument(fileName, file);
        }
        return file;
    }

    previewReport(reportPreview: ReportPreviewDto, smartobjects: SmartObjectDto[],
        context: WorkflowInstanceContextDto): Observable<any> {

        const loader: WorkflowDialogLoad = { message: 'TASK-MODEL-PROCESS.TASK.REPORT.GENERATING' };
        this.workflowDialog.pushLoad(loader);

        const _reportPreview: ReportPreviewDto = _.cloneDeep(reportPreview);
        _reportPreview.data = this.calculateData(reportPreview.data, smartobjects, context.jwt);

        return this.reportService.previewReports(_reportPreview).pipe(
            map((value: Blob) => {
                return this.printFile(value, _reportPreview.fileName, _reportPreview.download, true);
            }),
            finalize(() => {
                this.workflowDialog.popLoad(loader);
            })
        );
    }

    generateReport(reportGenerate: ReportGenerateDto, smartobjects: SmartObjectDto[],
        context: WorkflowInstanceContextDto): Observable<any> {

        const loader: WorkflowDialogLoad = { message: 'TASK-MODEL-PROCESS.TASK.REPORT.GENERATING' };
        this.workflowDialog.pushLoad(loader);

        const _reportGenerate: ReportGenerateDto = _.cloneDeep(reportGenerate);
        _reportGenerate.data = this.calculateData(reportGenerate.data, smartobjects, context.jwt);

        return this.reportService.generateReports(_reportGenerate).pipe(
            map((value: Blob) => {
                return this.printFile(value, _reportGenerate.fileName, _reportGenerate.download, true);
            }),
            finalize(() => {
                this.workflowDialog.popLoad(loader);
            })
        );
    }

    private _getExt(contentType: string): string {
        if (contentType === 'application/pdf') {
            return '.pdf';
        } else if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return '.xlsx';
        } else {
            return '.pdf';
        }
    }

    getFile(fileUuid: string, context: WorkflowInstanceContextDto): Observable<File> {
        const sysFile: SysFile = {
            documentID: '',
            versionID: fileUuid,
            name: '',
            ext: '',
            size: 0,
            dateUpdated: '',
            reason: '',
            user: '',
            tags: [],
            metadatas: [],
        };

        return this.fileService.getAsset(fileUuid).pipe(
            mergeMap((asset: FileAssetDto) => {
                return ((!asset || !asset.private) && !this.network.offline) ?
                    this.fileService.downloadDocument(sysFile, false) :
                    of(asset);
            }),
            map((asset: FileAssetDto) => {
                return asset.file;
            }),
        );
    }

    getFileB64(fileUuid: string, context: WorkflowInstanceContextDto): Observable<string> {
        return this.getFile(fileUuid, context).pipe(
            mergeMap((file) => this.fileService._readFileToBase64(file))
        );
    }

    generateXReport(templateUuid: string, inputs: any[], fileName: string, ext: string, download: boolean,
        smartobjects: SmartObjectDto[], context: WorkflowInstanceContextDto): Observable<File> {

        const loader: WorkflowDialogLoad = { message: 'TASK-MODEL-PROCESS.TASK.REPORT.GENERATING' };
        this.workflowDialog.pushLoad(loader);

        return this.getFile(templateUuid, context).pipe(
            mergeMap((file: File) => {
                return this.templaterParseData(file, inputs, ext, smartobjects, context);
            }),
            map((blob: Blob) => {
                const file = this.createFile(blob, `${fileName.split('.')[0]}.${ext}`, blob.type);
                if (download) {
                    this.fileService.openDocument(file, `${fileName.split('.')[0]}.${ext}`);
                }
                return file;
            }),
            finalize(() => {
                this.workflowDialog.popLoad(loader);
            })
        )
    }

    templaterParseData(file: File, inputs: any[], ext: string, smartobjects: SmartObjectDto[],
        context: WorkflowInstanceContextDto): Observable<Blob> {
        
        expressions.filters.size = function (input, width, height) {
            return {
                data: input,
                size: [width, height],
            };
        };

        expressions.filters.maxSize = function (input, width, height) {
            return {
                data: input,
                maxSize: [width, height],
            };
        };
        const angularParser = (tag) => {
            if (tag === '.') {
                return {
                    get: function (s) { return s; }
                };
            }
            const expr = expressions.compile(
                tag.replace(/(’|‘)/g, "'").replace(/(“|”)/g, '"')
            );
            return {
                get: function (scope, context) {
                    let obj = {};
                    const scopeList = context.scopeList;
                    const num = context.num;
                    for (let i = 0, len = num + 1; i < len; i++) {
                        obj = Object.assign(obj, scopeList[i]);
                    }
                    return expr(scope, obj);
                }
            };
        };
        
        return new Observable<Blob>(observer => {
            const reader = this.fileService.getFileReader();
            reader.readAsArrayBuffer(file);
            reader.onloadend = (evt) => {
                const z = new PizZip(evt.target.result);
                let template;
                try {
                    template = new Templater(z, { linebreaks: true, parser: angularParser,
                        modules: this.docxTemplaterModules.modules(), nullGetter() { return ""; } });
                    template.resolveData(this.soUtilsService.nestedSmartObjectsProps(inputs, smartobjects, context)).then(() => {
                        try {
                            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
                            template.render();
                        } catch (error) {
                            // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
                            throw this.taskUtils.handleError('ERR-028', error, TaskReportCreateError);
                        }
                        this.zone.run(() => {
                            observer.next(template.getZip().generate({
                                type: 'blob',
                                mimeType: (ext === 'xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                                    (ext === 'xlsm') ? 'application/vnd.ms-excel.sheet.macroEnabled.12' :
                                        (ext === 'pptx') ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :
                                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            }));
                        })
                    }, (err) => {
                        this.zone.run(() => {
                            observer.error(new TaskReportCreateError('ERR-029', `{{FAILED-TO-GENERATE-REPORT}}: ${err.name}`));
                        });
                    })
                } catch (error) {
                    this.zone.run(() => {
                        observer.error(this.taskUtils.handleError('ERR-030', error, TaskReportCreateError));
                    });
                }


            };
        });
    }

    async downloadWithConfirmation(askConfirmation: boolean, file: File, fileName: string) {
        if (askConfirmation) {
            const toast = await this.toastController.create({
                header: this.translate.instant('TASK-MODEL-PROCESS.TASK.REPORT.CONFIRM-DOWNLOAD'),
                message: this.translate.instant('TASK-MODEL-PROCESS.TASK.REPORT.CONFIRM-DOWNLOAD-TEXT'),
                position: 'bottom',
                color: 'primary',
                animated: true,
                buttons: [
                    {
                        text: this.translate.instant('TASK-MODEL-PROCESS.TASK.REPORT.CONFIRM-DOWNLOAD-BUTTON'),
                        handler: () => {
                            this.fileService.openDocument(file, fileName);
                        }
                    }
                ]
            });
            toast.present();
        } else {
            this.fileService.openDocument(file, fileName);
        }
    }

    printFile(blob: Blob, fileName: string, download: boolean, askConfirmation: boolean): File {
        const re = /(?:\.([^.]+))?$/;
        fileName = (re.exec(fileName)[1]) ? fileName : fileName + this._getExt(blob.type);

        const file = this.createFile(blob, fileName, blob.type);
        if (download) {
            this.downloadWithConfirmation(false, file, fileName);
        }
        return file;
    }

    createFile(blob: any, fileName: string, fileType: string): File {
        const file: File = this.fileService._toFile([blob], fileName, fileType);
        return file;
    }

    getBase64FromSysFile(wfUuid: string, file: SysFile): Observable<string> {
        return this.fileService.getAsset(file.versionID).pipe(
            mergeMap((asset: FileAssetDto) => {
                return !asset ? this.fileService.downloadDocument(file, wfUuid, false) : of(asset);
            }),
            mergeMap((_asset: FileAssetDto) => {
                return this.fileService._readFileToBase64(_asset.file);
            }));
    }

    getSysFileInputs(wfUuid: string, inputs: PairDto[], keysTypes: WorkflowVariableModelDto[],
        context: WorkflowInstanceContextDto): Observable<PairDto[]> {
        const inputs$: Observable<PairDto>[] = _.map(inputs, (input: PairDto) => {
            const keyType: WorkflowVariableModelDto = _.find(keysTypes,
                (key: WorkflowVariableModelDto) => (key.key === input.key));
            if (input.value && keyType && keyType.type === 'sys:file') {
                return this.getBase64FromSysFile(wfUuid, input.value as SysFile).pipe(
                    catchError(() => {
                        return of('');
                    }),
                    mergeMap((base64) => {
                        return of({
                            key: input.key,
                            value: base64
                        });
                    }),
                );
            } else {
                return of(input);
            }

        });

        return inputs$.length === 0 ? of([]) : zip(...inputs$);
    }

    convertFile(versionId: string, filename: string, open: boolean, context: WorkflowInstanceContextDto) {
        return this.fileService.getAsset(versionId).pipe(
            mergeMap((asset: FileAssetDto) => {
                return asset ?
                    this.convertService.convertFileWithFile(asset.file, filename) :
                    this.convertService.convertFile(versionId);
            }),
            catchError((err) => {
                throw new TaskConvertError('ERR-052', `{{FILE-CONVERSION-FAILED}} : ${err}`);
            }),
            mergeMap((file: File) => {
                return (open ? from(this.fileService.openDocument(file, filename)) : of(null)).pipe(
                    map(() => {
                        return file;
                    }),
                );
            }),
        );
    }

    openFileDocument(fileName: string, file: File) {
        this.fileService.openDocument(file, fileName)
    }
}
