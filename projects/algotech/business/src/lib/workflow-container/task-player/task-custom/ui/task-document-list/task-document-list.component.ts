import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { zip, of, Observable } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { TaskDocumentListError } from '../../../../container-error/container-error';
import * as _ from 'lodash';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { TaskDocumentListDto } from '../../../../dto/task-document-list.dto';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { TranslateService } from '@ngx-translate/core';
import { SmartObjectDto, DocumentDto, VersionDto, SysFile } from '@algotech/core';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { WorkflowDialogService } from '../../../../../workflow-dialog/workflow-dialog.service';
import { DataService, RxExtendService } from '@algotech/angular';
import { Platform } from '@ionic/angular';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

interface FileView {
    sysfile: SysFile;
    formatedDate: string;
    tags: string;
    status: number;
    icon: string;
    asset?: FileAssetDto;
    url?: string;
    checked?: boolean;
}

@Component({
    templateUrl: './task-document-list.component.html',
    styleUrls: ['./task-document-list.style.scss']
})
export class TaskDocumentListComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    searchVisible = true;
    documents = [];

    listVersions: SysFile[] = [];
    listAssets: FileAssetDto[] = [];
    listViews: FileView[] = [];
    listViewsListed: FileView[] = [];
    listViewsFiltered: FileView[] = [];
    searchValue = '';

    pageDefaultSize = 10;
    page = 0;
    moreDataToLoad = true;
    isLoading = false;

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskDocumentListDto;
        zip(
            customData.search(),
            customData.documents ? customData.documents() : of(null),
        ).
            subscribe((values: any[]) => {
                this.searchVisible = values[0];
                this.documents = _.isArray(values[1]) ? values[1] : [values[1]];
                this.onLoad();
            }, (err) => { this.handleError.emit(this.taskUtils.handleError('ERR-083', err, TaskDocumentListError)); });
    }

    constructor(
        private soUtils: SoUtilsService,
        private platform: Platform,
        private dataService: DataService,
        private workflowDialog: WorkflowDialogService,
        private filesService: FilesService,
        private rxExtend: RxExtendService,
        private translate: TranslateService,
        private taskUtils: TaskUtilsService) { }


    getAsset(version: SysFile): FileAssetDto {
        return _.find(this.listAssets, (la: FileAssetDto) => la.infoFile.documentID === version.documentID);
    }

    createActivedFileView(version: SysFile): FileView {
        const newDate = new Date(version.dateUpdated);
        let sIcon: string;
        let iStatus: number;

        const myAsset = this.getAsset(version);
        if (myAsset) {
            if (version.versionID === myAsset.infoFile.versionID) {
                sIcon = 'fa-solid fa-database';
                iStatus = 1;
            } else {
                sIcon = 'fa-solid fa-rotate';
                iStatus = 2;
            }
        } else {
            iStatus = 3;
            sIcon = 'fa-solid fa-arrow-circle-down';
        }

        const vFile: FileView = {
            sysfile: version,
            formatedDate: newDate.toLocaleDateString(this.translate.currentLang),
            tags: version.tags.join(', '),
            asset: myAsset,
            status: iStatus,
            icon: sIcon
        };
        return vFile;
    }

    checkedItem(elt: FileView) {
        elt.checked = !elt.checked;
        this.listViewsListed = [...this.listViewsListed];
    }

    validateAlert() {
        const files: FileView[] = _.filter(this.listViews, (view: FileView) => view.status === 2);
        if (files && files.length > 0) {
            this.showToast.emit({ message: 'TASK-MODEL-GUI.TASK.DOCUMENT-LIST.DOCS-UPDATED', time: 3000 });
        }
    }

    loadListAssets(): Observable<any> {
        const versionsID: string[] = [];
        if (this.documents.length > 0 && this.documents[0] instanceof SmartObjectDto) {
            // add all version
            _.forEach(this.documents, (object: SmartObjectDto) => {
                if (object.skills.atDocument && object.skills.atDocument.documents) {
                    _.forEach(this.soUtils.getDocuments(object, this._task.instance.documents), (document: DocumentDto) => {
                        _.forEach(document.versions, (version: VersionDto) => {
                            versionsID.push(version.uuid);
                        });
                    });
                }
            });
        } else {
            versionsID.push(..._.map(this.listVersions, (version: SysFile) => version.versionID));
        }

        return this.filesService.getAssets(_.uniq(versionsID)).pipe(
            tap((res: FileAssetDto[]) => {
                this.listAssets = res;
            })
        );
    }

    onOpenActions(event, element) {
        event.stopPropagation();
        this.workflowDialog.openOptions(element, {
            actions: [{
                icon: 'fa-solid fa-rotate',
                caption: this.translate.instant('DOCUMENTS.ACTIONS.UPDATE'),
                color: 'var(--ALGOTECH-PRIMARY)',
                disabled: !this.filesService.hasStorage(),
                onClick: () => {
                    this.downloadElement(false);
                },
            }, {
                icon: this.platform.is('capacitor') || this.platform.is('cordova') ? 'fa-solid fa-eye' : 'fa-solid fa-download',
                caption: this.platform.is('capacitor') || this.platform.is('cordova') ? this.translate.instant('DOCUMENTS.ACTIONS.OPEN') :
                    this.translate.instant('DOCUMENTS.ACTIONS.DOWNLOAD'),
                color: 'var(--ALGOTECH-PRIMARY)',
                disabled: false,
                onClick: () => {
                    this.downloadElement(true);
                }
            }, {
                icon: 'fa-solid fa-trash',
                caption: this.dataService.mobile ? this.translate.instant('DOCUMENTS.ACTIONS.REMOVE_FROM_MOBILE') :
                    this.translate.instant('DOCUMENTS.ACTIONS.REMOVE_FROM_STORAGE'),
                color: 'var(--ALGOTECH-DANGER)',
                disabled: !this.filesService.hasStorage() || this.listViewsFiltered
                    .filter((file) => file.checked)
                    .some((file) => file.status === 3),
                onClick: () => {
                    this.deleteElement();
                },
            }]
        });
    }

    loadFiles() {
        this.listViews = _.map(this.listVersions, (version: SysFile) => {
            return this.createActivedFileView(version);
        });

        this.listViewsFiltered = _.clone(this.listViews);
        this.loadList(this.getListParameters(0));

        if (this.listViewsListed.length < this.pageDefaultSize) {
            this.moreDataToLoad = false;
        }
    }

    onLoad() {

        this.listVersions = this.soUtils.transformListObject(this.documents, this._task.instance.documents);
        this.loadListAssets().subscribe(() => {
            this.loadFiles();
            this.validateAlert();
        });

        // transfer not required
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: [],
        };

        this.partialValidate.emit({ validation, authorizationToNext: true });
    }

    getListParameters(page: number): any[] {
        return [
            { key: 'skip', value: page },
            { key: 'limit', value: this.pageDefaultSize }
        ];
    }

    doInfinite() {
        this.loadList(this.getListParameters(this.page));
    }

    loadElements(parameters: any[]): Observable<FileView[]> {
        const start = parameters[0].value * parameters[1].value;
        const file: FileView[] = this.listViewsFiltered.slice(start, start + parameters[1].value);
        return of(file);
    }

    loadList(parameters: any[]) {
        this.isLoading = true;
        this.loadElements(parameters).subscribe(
            (listView: FileView[]) => {
                if (listView && listView.length > 0) {
                    this.listViewsListed.push(...listView);
                    this.page++;
                    this.moreDataToLoad = (listView.length === this.pageDefaultSize);
                } else {
                    this.moreDataToLoad = false;
                }
                this.isLoading = false;
            }, (err) => {
                this.handleError.emit(new TaskDocumentListError('ERR-084',`{{FAILED-TO-LOAD-LIST}} ${err}`));
            }
        );
    }

    downloadElement(open = false) {
        const downloadRq$: Observable<any>[] = _.compact(this.listViewsListed.filter((f) => f.checked).map((file) => {
            // file on disk and open
            if (file.status !== 3 && open) {
                return new Observable((observer) => {
                    this.filesService.openDocument(file.asset.file, file.asset.infoFile.name);
                    observer.next();
                }).pipe(delay(1000));
            }

            // download
            const obsDownload = file.status !== 1 ? this.filesService.downloadDocument(file.sysfile, false) : of(file.asset);
            return obsDownload.pipe(tap((asset: FileAssetDto) => {
                this.loadListAssets().subscribe(
                    () => {
                        _.merge(file, this.createActivedFileView(asset.infoFile)); // merge the instance
                        if (open) {
                            this.filesService.openDocument(asset.file, asset.infoFile.name);
                        }
                    }
                );
            }));
        }));
        this.rxExtend.sequence(downloadRq$).subscribe();
    }

    deleteElement() {
        const deleteRq$: Observable<any>[] = _.compact(this.listViewsListed.filter((f) => f.checked).map((file) => {
            if (file.status !== 3) {
                const delete$ = this.filesService.removeAsset(file.sysfile.versionID);
                if (!delete$) {
                    return null;
                }
                return delete$.pipe(
                    tap(() => {
                        this.loadListAssets().subscribe(() => {
                            _.merge(file, this.createActivedFileView(file.asset.infoFile)); // merge the instance
                        });
                    })
                );
            }
            return null;
        }));
        this.rxExtend.sequence(deleteRq$).subscribe();
    }

    filterElements() {
        this.listViewsFiltered = this.listViews.filter((view) => {
            return view.sysfile.name.toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1;
        });
        this.page = 0;
        this.listViewsListed = [];
        this.loadList(this.getListParameters(0));
    }
}
