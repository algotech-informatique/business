import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FilesService } from '../../../../../../../workflow-interpretor/@utils/files.service';
import { AuthService, DataService } from '@algotech/angular';
import { SysFile } from '@algotech/core';
import { FileUploadDto, AnnotationDto } from '@algotech/core';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { InterpretorTaskActionAssetDto, WorkflowTaskActionUploadDto } from '../../../../../../../../../interpretor/src/dto';

import * as _ from 'lodash';
import { of } from 'rxjs';
import { FileAssetDto } from '../../../../../../../dto/file-asset.dto';
import { SoFormService } from '../../../../so-form.service';
import { Platform, ModalController } from '@ionic/angular';
// tslint:disable-next-line: max-line-length
import { SoFormPropertyInputPhotoViewerComponent } from './so-form-property-input-photo-viewer/so-form-property-input-photo-viewer.component';
import { mergeMap, tap } from 'rxjs/operators';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';

@Component({
    selector: 'at-so-form-property-input-photo',
    styleUrls: ['./so-form-property-input-photo.component.scss'],
    templateUrl: './so-form-property-input-photo.component.html',
})
export class SoFormPropertyInputPhotoComponent implements AfterViewInit {

    @Input() disabled = false;
    _value: any = null;

    @Input()
    get value() {
        return this._value;
    }

    @Output()
    valueChange = new EventEmitter();
    set value(data) {
        this._value = data;
        this.valueChange.emit(data);
    }
    @Output() changeValue = new EventEmitter;
    fileImage = null;

    FILE_NAME = 'extended.jpeg';
    FILE_TYPE = 'image/jpeg';

    constructor(
        public dataService: DataService,
        private modalController: ModalController,
        private soFormService: SoFormService,
        private authService: AuthService,
        private filesService: FilesService,
    ) { }

    ngAfterViewInit() {
        this.calculate();
    }

    uploadPhoto() {
        if (this.disabled) {
            return ;
        }
        const fileInput = document.createElement('input');
        fileInput.addEventListener('change', () => {
            this.createPhoto(fileInput.files[0]);
        }, false);
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();
    }

    takePhoto() {
        if (this.disabled) {
            return ;
        }
        const options: ImageOptions = {
            quality: 50,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            width: 1024,
        };

        Camera.getPhoto(options).then((image: Photo) => {
            const file: File = this.filesService._decodeB64(image.base64String, this.FILE_NAME, this.FILE_TYPE);
            this.createPhoto(file);
        }, (err: any) => {
            // Handle error
        });
    }

    findAction(): InterpretorTaskActionAssetDto {
        if (!this.value) {
            return null;
        }
        return _.find(this.soFormService.actions, (action: InterpretorTaskActionAssetDto) => {
            return action.value.file === this.value.versionID;
        });
    }

    calculate() {
        // current actions
        if (this.value) {
            const findAction = this.findAction();
            const obsFile = findAction && findAction.asset ? of(findAction.asset) :
                this.filesService.getAsset(this.value.versionID);

            obsFile.pipe(
                mergeMap((asset: FileAssetDto) => {
                    return !asset ? this.filesService.downloadDocument(this.value, this.soFormService.contextUuid, false) : of(asset);
                }),
                mergeMap((_asset: FileAssetDto) => {
                    return this.filesService._readFileToBase64(_asset.file);
                }),
                tap((res: string) => {
                            this.fileImage = res;
                })
            ).subscribe();
        } else {
            this.fileImage = null;
        }
    }

    async onPhotoView() {
        // todo view photo
        const deletePhoto = new EventEmitter<any>();
        const back = new EventEmitter<any>();
        const modal = await this.modalController.create({
            component: SoFormPropertyInputPhotoViewerComponent,
            componentProps: {
                deletePhoto,
                back,
                disabled: this.disabled,
                b64: this.fileImage
            },
        });

        back.subscribe(() => {
            return modal.dismiss();
        });
        deletePhoto.subscribe(() => {

            const findAction = this.findAction();
            // rm action
            if (findAction) {
                this.soFormService.actions.splice(this.soFormService.actions.indexOf(findAction), 1);
            }

            this.value = null;

            this.calculate();
            this.changeValue.emit();

            return modal.dismiss();
        });
        return await modal.present();
    }

    createPhoto(file: File) {
        const versionID = UUID.UUID();
        const documentID = UUID.UUID();
        const annotations: AnnotationDto[] = [];

        // fileUploadDto
        const info: FileUploadDto = {
            documentID,
            versionID,
            reason: '',
            tags: '',
            userID: this.authService.localProfil.id,
            metadatas: '',
        };

        // data
        const sysFile: SysFile = {
            dateUpdated: moment().format(),
            documentID,
            versionID,
            ext: 'JPEG',
            name: this.FILE_NAME,
            reason: '',
            tags: [],
            metadatas: [],
            size: file.size,
            user: this.authService.localProfil.id,
            annotations
        };

        // action
        const upload: WorkflowTaskActionUploadDto = {
            fileName: this.FILE_NAME,
            fileType: this.FILE_TYPE,
            file: versionID,
            info,
        };
        const action: InterpretorTaskActionAssetDto = {
            actionKey: 'upload',
            asset: {
                file,
                private: this.soFormService.contextUuid,
                saved: false,
                infoFile: sysFile,
            },
            value: upload
        };

        this.soFormService.actions.push(action);
        this.value = sysFile;

        this.calculate();
        this.changeValue.emit();
    }
}

