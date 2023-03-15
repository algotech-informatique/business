import { AuthService } from '@algotech/angular';
import { AnnotationDto, FileEditDto, FileUploadDto, SmartObjectDto, SysFile } from '@algotech/core';
import { Injectable } from '@angular/core';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import moment from 'moment';
import { InterpretorTaskDto, InterpretorTransferTransitionDto,
    WorkflowTaskActionEditDocumentDto, WorkflowTaskActionUploadDto } from '../../../../../../../interpretor/src';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilesService } from '../../../../../workflow-interpretor/@utils/files.service';
import { FileAssetDto } from '../../../../../dto/file-asset.dto';
import { CameraFile } from '../../../../../dto/camera-file.dto';


@Injectable()
export class TaskCameraService {

    constructor(
        private authService: AuthService,
        private filesService: FilesService,
    ) {
    }

    getLastName(defaultName: string, listPhotos: CameraFile[]): string {
        const names: string[] = _.map(_.filter(listPhotos, (photo: CameraFile) => photo.name.includes(defaultName))
            , (photo: CameraFile) => {
                const name = photo.name;
                const subName = name.substring(name.lastIndexOf('_') + 1, name.length);
                return _.replace(subName, new RegExp('.jpeg'), '');
            });

        if (names.length !== 0) {
            const numbers: number[] = _.map(names, item => {
                return parseInt(item, 10);
            });
            const max: number = numbers.reduce((a, b) => Math.max(a, b));
            return defaultName + '_' + (max + 1).toString() + '.jpeg';
        } else {
            return defaultName + '_1.jpeg';
        }
    }

    createPhoto(file: File): CameraFile {
        const versionID = UUID.UUID();
        const documentID = UUID.UUID();
        const annotations: AnnotationDto[] = [];

        const cameraFile: CameraFile = {
            dateUpdated: moment().format(),
            documentID: documentID,
            versionID: versionID,
            ext: 'JPEG',
            name: file.name,
            reason: '',
            tags: [],
            metadatas: [],
            size: file.size,
            user: this.authService.localProfil.id,
            annotations,
            file
        };
        return cameraFile;
    }


    createPhotoWithAsset(asset: FileAssetDto): CameraFile {
        const cameraFile: CameraFile = _.cloneDeep(asset.infoFile);
        cameraFile.saved = asset.saved;
        cameraFile.file = asset.file;

        return cameraFile;
    }

    _createActionTransfer(photo: CameraFile, task: InterpretorTaskDto, so: SmartObjectDto, editionAnnotation: boolean) {

        const info: FileUploadDto = {
            documentID: photo.documentID,
            versionID: photo.versionID,
            reason: '',
            tags: _.join(photo.tags, ','),
            userID: this.authService.localProfil.id,
            metadatas: '',
        };

        const asset: FileAssetDto = {
            file: photo.file,
            infoFile: this.toSysFile(photo),
            private: task.instance.uuid,
            saved: photo.saved,
        };

        const actionUpload: WorkflowTaskActionUploadDto = {
            smartObject: so.uuid,
            fileName: photo.name,
            fileType: photo.file.type,
            file: photo.versionID,
            info
        };

        const transfers: InterpretorTransferTransitionDto[] = [{
            saveOnApi: true,
            type: 'action',
            value: {
                actionKey: 'upload',
                asset,
                value: actionUpload
            }
        }];

        if (editionAnnotation) {
            const edit: FileEditDto = {
                uuid: photo.documentID,
                annotations: photo.annotations,
            };

            const actionEdit: WorkflowTaskActionEditDocumentDto = {
                smartObject: so.uuid,
                edit
            };

            transfers.push({
                saveOnApi: true,
                type: 'action',
                value: {
                    actionKey: 'edit-document',
                    value: actionEdit,
                }
            });
        }
        return transfers;
    }

    toSysFile(file: CameraFile): SysFile {
        const res = _.cloneDeep(file);
        delete res.file;
        delete res.saved;
        return res;
    }
}
