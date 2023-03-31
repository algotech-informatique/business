import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { TaskUploadDto } from '../../../../dto/task-upload.dto';
import { zip, Observable, of } from 'rxjs';
import { TaskUploadError } from '../../../../container-error/container-error';
import { SmartObjectDto, WorkflowTaskActionDto, FileUploadDto, TagListDto, SysFile, DocumentMetadatasDto } from '@algotech-ce/core';
import { SettingsDataService } from '@algotech-ce/angular';
import * as _ from 'lodash';
import { InterpretorTransferTransitionDto, WorkflowTaskActionUploadDto } from '../../../../../../../interpretor/src/dto';
import { UUID } from 'angular2-uuid';
import { WorkflowUtilsService } from '../../../../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { InterpretorTaskDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { AuthService } from '@algotech-ce/angular';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { TagsUtilsService } from '../../../../../workflow-interpretor/@utils/tags-utilis.service';
import { DocumentsMetaDatasSettingsDto } from '@algotech-ce/core';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


@Component({
    templateUrl: './task-upload.component.html',
    styleUrls: ['./task-upload.style.scss']
})
export class TaskUploadComponent implements TaskComponent {

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskUploadDto;
        zip(
            customData.multiple(),
            customData.documents(),
            customData.version ? customData.version() : of(null),
            customData.activeTag ? customData.activeTag() : of(false),
            customData.activeMetadata ? customData.activeMetadata() : of(false),
            customData.modelsTag ? customData.modelsTag() : of([]),
        )
            .subscribe((values: any[]) => {
                this.multiple = values[0];
                this.soDocument = values[1];
                this.version = values[2];
                const allListsTags: TagListDto[] = this.settingsDataService.tags;
                this.tagsListsBase = _.filter(allListsTags, (listTag: TagListDto) => _.includes(values[5], listTag.key));
                this.taggable = values[3];
                this.tags = this.version && this.version.tags ? this.version.tags : [];
                this.metadatasList = this.settingsDataService.settings.documents.metadatas;
                this.metadatable = values[4];
                this.onLoad();
            }, (err) => {
                this.handleError.emit(this.taskUtils.handleError('ERR-072', err, TaskUploadError));
            });
    }
    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    multiple = false;
    hasFile = false;
    soDocument: SmartObjectDto = null;
    version: SysFile = null;
    transferData: InterpretorTransferTransitionDto[] = [];
    historyFiles: FileAssetDto[] = [];
    nameExists = '';
    fileZero = '';
    fileTooBig = '';
    error = '';
    taggable: boolean;
    tags: string[];
    tagsListsBase: TagListDto[];
    tagsLists: TagListDto[];
    metadatable: boolean;
    metadatas: DocumentMetadatasDto[] = [];
    metadatasList: DocumentsMetaDatasSettingsDto[];
    files: File[] = [];

    constructor(
        private workflowUtilsService: WorkflowUtilsService,
        private soUtils: SoUtilsService,
        private translate: TranslateService,
        private authService: AuthService,
        protected settingsDataService: SettingsDataService,
        private tagsUtilsService: TagsUtilsService,
        private fileService: FilesService,
        private taskUtils: TaskUtilsService
    ) { }

    onLoad() {
        const actions = _.map(
            this.workflowUtilsService.getActiveTask(this._task.instance).operations.filter((op) => op.type === 'action'),
            ((operation) => operation.value)
        );

        const files$: Observable<FileAssetDto>[] = _.reduce(actions, (results, action: WorkflowTaskActionDto) => {
            if (action.actionKey === 'upload') {
                const _action: WorkflowTaskActionUploadDto = action.value;
                if (_action.info?.versionID) {
                    results.push(this.fileService.getAsset(_action.info?.versionID));
                }
            }
            return results;
        }, []);

        // restore history
        if (files$.length > 0) {
            zip(...files$).subscribe((res) => {
                this.historyFiles = _.compact(res);
                if (this.historyFiles.length > 0) {
                    this.metadatas = this.historyFiles[0].infoFile.metadatas;
                    this.tags = this.historyFiles[0].infoFile.tags;
                    this.onFilesAdded(this.historyFiles.map((f) => f.file), false);
                }
            });
        }
    }

    onFilesAdded(files: File[], changes = true) {
        if (!Array.isArray(files) || files.length === 0) {
            this.handleError.emit(new TaskUploadError('ERR-073', '{{DATA-UPLOAD-CORRUPTED}}'));
        }

        this.nameExists = '';

        const isImage = _.find(files, (file: File) => _.includes(file.type, 'image'));
        this.tagsLists = this.tagsUtilsService.filterDocumentTagsLists(this.tagsListsBase, isImage);

        // validate size not zero
        this.fileZero = this.translate.instant('TASK-UPLOAD.SIZE-ZERO');
        const filesZero: string[] = _.map(files.filter((file) => file.size === 0), (file) => {
            return file.name;
        });
        this.fileZero = (filesZero.length !== 0) ? ' ' + this.fileZero + _.join(filesZero, ', ') : '';

        // validate size too big
        const filesTooBig: string[] = _.map(files.filter((file) => file.size > 100000000), (file: File) => file.name);
        this.fileTooBig = filesTooBig.length !== 0 ?
            this.translate.instant('TASK-UPLOAD.SIZE-TOO-BIG') + _.join(filesTooBig, ', ') :
            '';

        // check name exist when no versionning
        if (!this.version) {
            for (const file of files) {
                if (this.soDocument.skills.atDocument && this.soDocument.skills.atDocument.documents) {
                    const documents = this.soUtils.getDocuments(this.soDocument, this._task.instance.documents);
                    if (documents.some((d) =>
                        d.name === file.name &&
                        !this.historyFiles.some((history) => d.versions.some((v) => v.uuid === history.infoFile.versionID)))
                        || this.files.some((f) => f.name === file.name)) {

                        this.nameExists = this.translate.instant('WORKFLOW.DOCUMENT.NAME-EXIST', { name: file.name });
                    }
                }
            }
        }

        this.calculateError();
        if (this.error) {
            return;
        } else {
            if (this.multiple) {
                this.files.push(...files);
            } else {
                this.files = files;
            }
            this._partialValidate(changes);
        }
    }

    calculateError() {
        this.error = this.nameExists + this.fileZero + this.fileTooBig;
    }

    onRemoveFile(index: number) {
        this.files.splice(index, 1);
        if (this.files.length === 0) {
            this.reset();
        } else {
            this._partialValidate();
        }
    }

    onTagChanged(tags: string[]) {
        this.tags = tags;
        this._partialValidate();
    }

    onMetadataChanged(metadatas: DocumentMetadatasDto[]) {
        this.metadatas = metadatas;
        this._partialValidate();
    }

    _partialValidate(changes = true) {
        const obsFiles: Observable<InterpretorTransferTransitionDto>[] = [];
        const ident = _.map(this.files.filter((file) => file.size > 0), (file) => {
            let versionID = UUID.UUID();
            let documentID = this.version ? this.version.documentID : UUID.UUID();
            let dateUpdated = moment().format();

            // restore
            if (!changes) {
                const history = this.historyFiles.find((f) => f.file === file);
                versionID = history ? history.infoFile.versionID : versionID;
                documentID = history ? history.infoFile.documentID : documentID;
                dateUpdated = history ? history.infoFile.dateUpdated : moment().format();
            }

            const info: FileUploadDto = {
                documentID,
                versionID,
                reason: '',
                tags: _.join(this.tags, ','),
                userID: this.authService.localProfil.id,
                metadatas: JSON.stringify(this.metadatas),
            };
            obsFiles.push(of(this._createActionTransfer(documentID, file, info, versionID, dateUpdated, this.tags)));

            return {
                file,
                documentID,
                versionID,
                dateUpdated
            };
        });

        if (ident.length > 0) {
            obsFiles.push(of(this._createDataTransfer(ident)));

            zip(...obsFiles).subscribe((resultFiles) => {
                this.transferData = _.compact(resultFiles);
                const validation: InterpretorValidateDto = this._computevalidation();
                this.partialValidate.emit({ validation, authorizationToNext: true });
            });
        }
    }

    reset() {
        this.fileTooBig = '';
        this.fileZero = '';
        this.nameExists = '';
        this.error = '';
        this.transferData = [];
        this.files = [];
        this.partialValidate.emit({ validation: null, authorizationToNext: false });
    }

    _computevalidation(): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: this.transferData
        };
        return validation;
    }

    _createActionTransfer(documentID: string, uploadFile: File, info: FileUploadDto, versionID: string, dateUpdated: string,
        tags: string[]) {
        const re = /(?:\.([^.]+))?$/;
        const ext = re.exec(uploadFile.name)[1] ? re.exec(uploadFile.name)[1] : uploadFile.type;

        const action: WorkflowTaskActionUploadDto = {
            smartObject: this.soDocument.uuid,
            fileName: uploadFile.name,
            fileType: uploadFile.type,
            file: versionID,
            info,
        };

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'upload',
                asset: {
                    file: uploadFile,
                    private: this._task.instance.uuid,
                    saved: false,
                    infoFile: {
                        documentID: documentID,
                        dateUpdated,
                        name: uploadFile.name,
                        ext: ext,
                        user: info.userID,
                        reason: info.reason,
                        size: uploadFile.size,
                        tags: tags,
                        metadatas: this.metadatas,
                        versionID: versionID
                    }
                },
                value: action
            }
        };
        return transfer;
    }

    _createDataTransfer(files: { file: File, documentID: string, versionID: string, dateUpdated: string }[]) {

        const data = this._getTransitionData(this._task);
        if (!data) {
            return null;
        }

        const re = /(?:\.([^.]+))?$/;

        const fileInfo: SysFile[] = _.map(files, (file: { file: File, documentID: string, versionID: string, dateUpdated: string }) => {

            const name = file.file.name;
            const ext = re.exec(name)[1] ? re.exec(name)[1] : file.file.type;

            const d: SysFile = {
                dateUpdated: file.dateUpdated,
                ext,
                name,
                documentID: file.documentID,
                versionID: file.versionID,
                reason: '',
                size: file.file.size,
                user: `${this.authService.localProfil.firstName} ${this.authService.localProfil.lastName}`,
                tags: this.tags,
                metadatas: this.metadatas,
            };

            return d;
        });

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data,
            type: 'sysobjects',
            value: this.multiple ? fileInfo : fileInfo[0],
        };

        return transfer;
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            return null;
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }
}
