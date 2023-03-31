import { TaskService } from '../../task-service.interface';
import { Injectable } from '@angular/core';
import { from, zip, Observable, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';

import { InterpretorTaskDto, WorkflowTaskActionUploadDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorValidateDto } from '../../../../../../../interpretor/src/dto';
import { InterpretorTransferTransitionDto } from '../../../../../../../interpretor/src/dto';

import { SmartObjectDto, FileUploadDto, SysFile } from '@algotech-ce/core';
import { TaskAutoPhotoError } from '../../../../container-error/container-error';
import { AuthService, DataService } from '@algotech-ce/angular';

import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { TaskAutoPhotoDto } from '../../../../dto/task-auto-photo.dto';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';

import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import moment from 'moment';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { TaskUtilsService } from '../../../../../workflow-interpretor/@utils/task-utils.service';


interface CameraFile {
    versionId: string;
    documentId: string;
    ident: Ident;
    sysFile: SysFile;
    fileUpload: FileUploadDto;
    b64file: string;
    file: File;
    saved: boolean;
}

interface Ident {
    file: File;
    documentID: string;
    versionID: string;
}

@Injectable()
export class TaskAutoPhotoService implements TaskService {

    soObjectLinked: SmartObjectDto = null;
    accesslocalStorage = false;
    tags: string[] = [];
    defaultName: string;
    oFile: File;
    _task: InterpretorTaskDto;

    options: ImageOptions = {
        quality: 50,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 1024,
        webUseInput: this.dataService.mobile,
    };

    constructor(
        private authService: AuthService,
        private filesService: FilesService,
        private dataService: DataService,
        private taskUtils: TaskUtilsService
    ) { }

    execute(task: InterpretorTaskDto): Observable<InterpretorValidateDto> {
        this._task = task;
        const customData = (task.custom as TaskAutoPhotoDto);
        return zip(
            customData.objectLinked(),
            customData.defaultName ? customData.defaultName() : of(''),
            customData.accessLocalStorage ? customData.accessLocalStorage() : of(false),
            customData.tags ? customData.tags() : of([]),
        ).pipe(            
            catchError((err) => {
                throw this.taskUtils.handleError('ERR-092', err, TaskAutoPhotoError);
            }),
            mergeMap((values: any[]) => {
                this.soObjectLinked = values[0];
                this.defaultName = values[1];
                this.accesslocalStorage = values[2];
                this.tags = values[3];

                return this.getPicture();
            }),
            mergeMap((base64: string) => {
                if (base64) {
                    const imageName = this.defaultName + '.jpeg';
                    this.oFile = this.filesService._decodeB64(base64, imageName, 'image/jpeg');
                    return this.filesService._readFileToBase64(this.oFile).pipe(
                        map((resFile) => {
                            const photo: CameraFile = this.createPhoto(this.oFile, resFile);
                            return this._computevalidation(this._validate(photo));
                        })
                    );
                } else {
                    return of({
                        transitionKey: 'cancel',
                        transfers: []
                    });
                }
            })
        );
    }

    getPicture(): Observable<string> {
        return from(Camera.getPhoto(this.options)).pipe(
            map((image: Photo) => {
                return image.base64String;
            }),
            catchError((err) => {
                return of('');
            }));
    }

    createPhoto(file: File, b64: string) {
        const versionID = UUID.UUID();
        const documentID = UUID.UUID();

        const ident: Ident = {
            file: file,
            documentID,
            versionID
        };

        const info: FileUploadDto = {
            documentID,
            versionID,
            reason: '',
            tags: _.join(this.tags, ','),
            userID: this.authService.localProfil.id,
            metadatas: '',
        };

        const sysFile: SysFile = {
            dateUpdated: moment().format(),
            documentID: documentID,
            versionID: versionID,
            ext: 'JPEG',
            name: file.name,
            reason: '',
            tags: this.tags,
            metadatas: [],
            size: file.size,
            user: this.authService.localProfil.id
        };

        const photo: CameraFile = {
            versionId: versionID,
            documentId: documentID,
            ident: ident,
            sysFile: sysFile,
            fileUpload: info,
            file: file,
            b64file: b64,
            saved: false,
        };
        return photo;
    }

    _validate(photo: CameraFile) {
        const obsFiles: InterpretorTransferTransitionDto[] = [];
        obsFiles.push(this._createActionTransfer(photo));
        obsFiles.push(this._createDataTransfer(photo.sysFile));
        const transferData: InterpretorTransferTransitionDto[] = _.compact(obsFiles);
        return transferData;
    }

    _createActionTransfer(photo: CameraFile) {
        const asset: FileAssetDto = {
            file: photo.file,
            infoFile: photo.sysFile,
            private: this._task.instance.uuid,
            saved: photo.saved,
        };

        const actionUpload: WorkflowTaskActionUploadDto = {
            smartObject: this.soObjectLinked.uuid,
            fileName: photo.sysFile.name,
            fileType: photo.file.type,
            file: photo.sysFile.versionID,
            info: photo.fileUpload
        };

        const transfers: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'upload',
                asset,
                value: actionUpload
            }
        };
        return transfers;
    }

    _createDataTransfer(sysFile: SysFile) {
        const data = this._getTransitionData(this._task);
        if (!data) {
            return null;
        }
        const transfer: InterpretorTransferTransitionDto = {
            saveOnApi: true,
            data,
            type: 'sysobjects',
            value: sysFile,
        };
        return transfer;
    }

    _computevalidation(transfers: InterpretorTransferTransitionDto[]): InterpretorValidateDto {
        const validation: InterpretorValidateDto = {
            transitionKey: 'done',
            transfers
        };
        return validation;
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
