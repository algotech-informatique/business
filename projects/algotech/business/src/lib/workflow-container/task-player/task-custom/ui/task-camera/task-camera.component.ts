import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TaskComponent } from '../../task.interface';
import { InterpretorTaskDto, WorkflowTaskActionUploadDto } from '../../../../../../../interpretor/src/dto';
import { TaskCameraDto } from '../../../../dto/task-camera.dto';
import { zip, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
    SmartObjectDto, WorkflowTaskActionDto, TagListDto,
    SysFile
} from '@algotech-ce/core';
import { DataService, SettingsDataService } from '@algotech-ce/angular';

import { TaskCameraError } from '../../../../container-error/container-error';
import { WorkflowUtilsService } from '../../../../../workflow-interpretor/workflow-utils/workflow-utils.service';
import { Camera, CameraDirection, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';

import * as _ from 'lodash';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';

import { NgxDropzoneComponent } from 'ngx-dropzone';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { TaskCameraService } from '../@services/task-camera.service';
import { AnnotationComponent } from '../../../../../@components/annotations/annotation.component';
import { CameraFile } from '../../../../../dto/camera-file.dto';
import { NgComponentError } from '../../../../../../../interpretor/src/error/tasks-error';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';

@Component({
    templateUrl: './task-camera.component.html',
    styleUrls: ['./task-camera.style.scss']
})
export class TaskCameraComponent implements TaskComponent {

    @Output() validate = new EventEmitter();
    @Output() partialValidate = new EventEmitter();
    @Output() showToast = new EventEmitter();
    @Output() handleError = new EventEmitter<NgComponentError>();

    @ViewChild(AnnotationComponent) taskAnnotation: AnnotationComponent;
    @ViewChild(NgxDropzoneComponent) dropComponent: NgxDropzoneComponent;

    multiple = false;
    accesslocalStorage = false;

    soObjectLinked: SmartObjectDto = null;

    transferData: InterpretorTransferTransitionDto[] = [];

    defaultName: string;

    editionAnnotation = false;
    listPhotos: CameraFile[] = [];

    taggable: boolean;
    tags: string[] = [];
    tagsLists: TagListDto[];

    _task: InterpretorTaskDto;
    @Input('task')
    set task(t: InterpretorTaskDto) {
        this._task = t;
        const customData = this._task.custom as TaskCameraDto;
        zip(
            customData.objectLinked(),
            customData.multiple(),
            customData.defaultName(),
            customData.editionAnnotation ? customData.editionAnnotation() : of(false),
            customData.accessLocalStorage ? customData.accessLocalStorage() : of(false),
            customData.activeTag ? customData.activeTag() : of(false),
            customData.modelsTag ? customData.modelsTag() : of([]),
        ).subscribe((values: any[]) => {
            this.soObjectLinked = values[0];
            this.multiple = values[1];
            this.defaultName = values[2];
            this.editionAnnotation = values[3];
            this.accesslocalStorage = values[4];
            const allListsTags: TagListDto[] = this.settingsDataService.tags;
            this.tagsLists = _.filter(allListsTags, (listTag: TagListDto) => _.includes(values[6], listTag.key) && listTag.applyToImages);
            this.taggable = values[5];

            this.onLoad();
        }, (err) => {
            this.handleError.emit(
                this.taskUtils.handleError('ERR-061', err, TaskCameraError));
        });
    }

    constructor(
        private workflowUtilsService: WorkflowUtilsService,
        private filesService: FilesService,
        private settingsDataService: SettingsDataService,
        private cameraService: TaskCameraService,
        private dataService: DataService,
        private taskUtils: TaskUtilsService
    ) { }

    takePhoto() {
        this.captureImg(CameraSource.Camera);
    }

    uploadGallery() {
        this.captureImg(CameraSource.Photos);
    }

    captureImg(source: CameraSource) {
        const options: ImageOptions = {
            quality: 50,
            resultType: CameraResultType.Base64,
            width: 1024,
            source,
            webUseInput: this.dataService.mobile,
        };

        Camera.getPhoto(options).then((image: Photo) => {
            const imageName = this.multiple ?
                this.cameraService.getLastName(this.defaultName, this.listPhotos) :
                this.defaultName + '.jpeg';
            const file: File = this.filesService._decodeB64(image.base64String, imageName, 'image/jpeg');
            this.createPhoto(file);
        });
    }

    onLoad() {
        const actions = _.map(
            this.workflowUtilsService.getActiveTask(this._task.instance).operations.filter((op) => op.type === 'action'),
            ((operation) => operation.value)
        );

        const history: SysFile[] = _.reduce(actions, (results, action: WorkflowTaskActionDto) => {
            if (action.actionKey === 'upload') {
                const _action: WorkflowTaskActionUploadDto = action.value;
                results.push(_action.info);
            }
            return results;
        }, []);
        this.loadFiles(history).subscribe();
    }

    loadFiles(sysFiles: SysFile[]): Observable<any> {
        const ids = _.map(sysFiles, (file: SysFile) => file.versionID);
        return this.filesService.getAssets(ids).pipe(
            tap((result: FileAssetDto[]) => {
                this.listPhotos = result.map((asset) => this.cameraService.createPhotoWithAsset(asset));
                this.tags = this.listPhotos.length > 0 ? this.listPhotos[0].tags : [];
            })
        );
    }

    createPhoto(file: File) {
        const photo: CameraFile = this.cameraService.createPhoto(file);
        if (this.multiple) {
            this.listPhotos = [...this.listPhotos, photo];
        } else {
            this.listPhotos = [photo];
        }
        this.taskAnnotation.currentPhoto = photo;
        this._partialValidate();
    }

    _partialValidate() {
        const transfers: InterpretorTransferTransitionDto[] = [];
        _.map(this.listPhotos, (photo: CameraFile) => {
            transfers.push(...
                this.cameraService._createActionTransfer(photo, this._task, this.soObjectLinked, this.editionAnnotation)
            );
        });

        const sysFiles: SysFile[] = _.map(this.listPhotos, (photo: CameraFile) => {
            return this.cameraService.toSysFile(photo);
        });
        if (sysFiles.length > 0) {
            transfers.push(this._createDataTransfer(sysFiles));

            this.transferData = _.compact(transfers);
            const validation: InterpretorValidateDto = this._computevalidation();
            this.partialValidate.emit({ validation, authorizationToNext: true });
        }
    }

    _computevalidation(): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers: this.transferData
        };
        return validation;
    }

    _createDataTransfer(sysFile: SysFile[]) {

        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data: this._getTransitionData(this._task),
            type: 'sysobjects',
            value: this.multiple ? sysFile : sysFile[0],
        };
        return transfer;
    }

    onReset() {
        this.transferData = [];
        this.listPhotos = [];
        this.partialValidate.emit({ validation: null, authorizationToNext: false });
    }

    onDeleteImage() {
        if (this.listPhotos.length !== 0) {
            this._partialValidate();
        } else {
            this.onReset();
        }
    }

    private _getTransitionData(task: InterpretorTaskDto): { key: string, type: string } {
        if (!task ||
            task.transitions.length === 0 ||
            task.transitions[0].data.length === 0 ||
            !task.transitions[0].data[0].key ||
            !task.transitions[0].data[0].type) {
            this.handleError.emit(new TaskCameraError('ERR-062', '{{TASK-PARAMETERS-CORRUPTED}}'));
        }
        return {
            key: task.transitions[0].data[0].key,
            type: task.transitions[0].data[0].type
        };
    }

    onTagsChanged(tags: string[]) {
        this.listPhotos = _.map(this.listPhotos, (photo: CameraFile) => {
            photo.tags = tags;
            return photo;
        });
        this._partialValidate();
    }

    onTaskAnnotationChange() {
        this._partialValidate();
    }
}
