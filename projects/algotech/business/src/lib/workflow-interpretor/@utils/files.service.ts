import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { AuthService, DataService, EnvService } from '@algotech/angular';
import { SysFile } from '@algotech/core';
import { from, concat, Observable, of, empty, throwError, Subject } from 'rxjs';
import { toArray, catchError, mergeMap, map, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { File as FileService, FileEntry, DirectoryEntry as DirEntry } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDialogService } from '../../workflow-dialog/workflow-dialog.service';
import { WorkflowDialogLoad } from '../../workflow-dialog/interfaces';
import { FileAssetDto } from '../../dto/file-asset.dto';
import { ToastService } from '../../@services/toast.service';

const PREFIX_ASSET = 'asset';
const DIR_ASSET = 'vision-files';

declare var window: any;

@Injectable()
export class FilesService {

    apiUrl: '';
    files: FileAssetDto[] = [];

    constructor(
        private authService: AuthService,
        private httpClient: HttpClient,
        private dataService: DataService,
        private platform: Platform,
        private fileService: FileService,
        private fileOpener: FileOpener,
        protected env: EnvService,
        private toastService: ToastService,
        private workflowDialog: WorkflowDialogService,
        private translate: TranslateService) {
        env.environment.subscribe((e) => this.apiUrl = e.API_URL);
    }

    getAll(filterOptions: 'public' | 'private' | 'all' = 'public'): Observable<FileAssetDto[]> {
        if (!this.dataService.storage) {
            return of([]);
        }
        const versions = _.map(this.dataService.keys.filter((key) => key.startsWith(PREFIX_ASSET)), (version) => {
            return version.replace(`${PREFIX_ASSET}-`, '');
        });

        return this.getAssets(versions).pipe(
            map((file: FileAssetDto[]) => {
                return file.filter((f) => {
                    switch (filterOptions) {
                        case 'all':
                            return true;
                        case 'private':
                            return f.private !== false;
                        case 'public':
                            return f.private === false;
                    }
                });
            })
        );
    }

    getAssets(ids: String[]): Observable<FileAssetDto[]> {
        const obsAssets: Observable<FileAssetDto>[] = _.map(ids, (version: string) => {
            return this.getAsset(version);
        });

        return concat(...obsAssets).pipe(
            catchError((err) => throwError(err)),
            toArray(),
            map((res) => res.filter((version) => version))
        );
    }

    getAsset(id: string): Observable<FileAssetDto> {
        return this.getStorage(id).pipe(
            map((assetStorage: FileAssetDto) => {
                if (assetStorage) {
                    return assetStorage;
                } else {
                    return null;
                }
            })
        );
    }

    setAsset(asset: FileAssetDto): Observable<any> {
        return this.setStorage(asset);
    }

    removeAsset(id: string): Observable<any> {
        if (!this.dataService.storage) {
            return;
        }
        return this.dataService.removeItem(`${PREFIX_ASSET}-${id}`);
    }

    hasStorage() {
        return !!this.dataService.storage;
    }

    downloadFile(uuid: string) {
        return this.httpClient.get(this.getURL(uuid, true, true), { responseType: 'blob' });
    }

    downloadDocument(sysFile: SysFile, _private: any, withLoading = true): Observable<FileAssetDto> {
        const loader: WorkflowDialogLoad = { message: this.translate.instant('WORKFLOW.FILE-SERVICE.DOWNLOADING', { name: sysFile.name }) };
        if (withLoading) {
            this.workflowDialog.pushLoad(loader);
        }

        return this.downloadFile(sysFile.versionID).pipe(
            finalize(() => {
                this.workflowDialog.popLoad(loader);
            }),
            mergeMap((blob) => {

                const file: File = this._toFile([blob], sysFile.name, blob.type);
                const asset = this.createAsset(file, sysFile, _private, true);
                if (!this.dataService.mobile) {
                    return of(asset);
                }
                return this.setAsset(asset).pipe((
                    map(() => asset)
                ));
            })
        );
    }

    async openDocument(file: File, filename: string) {
        if (this.platform.is('cordova') || this.platform.is('capacitor')) {
            // open
            const blob = this._toFile([file], filename, file.type);
            this.fileService.createDir(this.fileService.dataDirectory, DIR_ASSET, true).then(
                (dirEntry: DirEntry) => {
                    this.fileService.checkDir(this.fileService.dataDirectory, DIR_ASSET).then(
                        () => {
                            this.fileService.getFile(dirEntry, filename, { create: true }).then(
                                (fileEntry: FileEntry) => {
                                    this.fileService.writeExistingFile(dirEntry.toURL(), filename, blob).then(
                                        () => {
                                            this.fileOpener.open(fileEntry.toURL(), file.type)
                                                .then()
                                                .catch(error);
                                        },
                                        error
                                    );
                                }, error);
                        }, error,
                    );
                });

            const error = async (err: Error) => {
                this.toastService.fail(this.translate.instant('ERROR-FILE-OPENER'));
            };
        } else {
            // download
            try {
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(file);
                downloadLink.download = filename;
                downloadLink.click();
            } catch (e) {
                this.toastService.fail(this.translate.instant('TASK-FILE-SERVICE.TASK.OPEN-DOCUMENT-ERROR'));
            }
        }
    }
    
    isImage(ext: string) {
        if (!ext) {
            return false;
        }
        const extensions = ['PNG', 'JPG', 'JPEG', 'TIFF', 'TIF', 'BMP', 'GIF', 'EPS', 'RAW', 'CR2', 'NEF', 'ORF', 'SR2'];
        if (extensions.lastIndexOf(ext.toUpperCase()) !== -1) {
            return true;
        } else {
            return false;
        }
    }

    readFile(file: string): Observable<string> {
        return from(this.fileService.readAsDataURL(file, file).then((value) => {
            return value;
        }));
    }

    getURL(versionId: string, byUUID: boolean, download: boolean, thumbnailSize?: string) {
        return `${this.apiUrl}/files/${versionId}${thumbnailSize ? `_thumbnail-${thumbnailSize}` : ''}` +
            `?jwt=${this.authService.localProfil.key}${byUUID ? '&byUUID=1' : ''}${download ? '&download=1' : ''}`;
    }

    createAsset(file: File, sysFile: SysFile, _private: any, saved: boolean): FileAssetDto {
        const asset: FileAssetDto = {
            file,
            infoFile: sysFile,
            private: _private,
            saved
        };
        return asset;
    }

    getStorage(id: string): Observable<FileAssetDto> {
        if (!this.dataService.storage) {
            return of(this.files.find((a) => a.infoFile.versionID === id));
        }
        return this.dataService.get(PREFIX_ASSET, id);
    }

    setStorage(asset: FileAssetDto): Observable<any> {
        if (!this.dataService.storage) {
            _.remove(this.files, (a: FileAssetDto) => a.infoFile.versionID === asset.infoFile.versionID);
            this.files.push(asset);
            return of({});
        }
        return this.dataService.save(asset, PREFIX_ASSET, asset.infoFile.versionID);
    }

    getApi(id: string) {
        return '';
    }

    createAssetFromApi(id: string): Observable<FileAssetDto> {
        return empty();
    }

    getFileReader(): FileReader {
        const fileReader = new FileReader();
        const zoneOriginalInstance = (fileReader as any)['__zone_symbol__originalInstance'];
        return zoneOriginalInstance || fileReader;
    }

    _readFileToBase64(file: File): Observable<string> {
        if (file?.type.startsWith('image')) {
            const blob = URL.createObjectURL(file);
            return new Observable((observer) => {
                const img = new Image();
                img.onload = () => {
                    const canvas: HTMLCanvasElement = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    observer.next(canvas.toDataURL(file.type));
                    observer.complete();
                };
                img.onerror = ((err) => observer.error(err));
                img.src = blob;
            });
        } else {
            const sub = new Subject<string>();
            const reader = this.getFileReader();

            reader.onload = () => {
                const content: string = (reader.result as string);
                sub.next(content);
                sub.complete();
            };

            try {
                reader.readAsDataURL(file);
                return sub.asObservable();
            } catch (e) {
                return of('');
            }
        }
    }

    _decodeB64(b64: string, fileName: string, fileType: string): File {
        if (b64.startsWith('data:image')) {
            b64 = b64.split('base64,')?.[1];
        }
        const byteCharacters = window.atob(b64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return this._toFile([byteArray], fileName, fileType);
    }

    _toFile(file: File | BlobPart[], fileName: string, fileType: string) {
        if (!this.platform.is('cordova') && !this.platform.is('capacitor')) {
            return file instanceof File ? file : new File(_.isArray(file) ? file as any : [file], fileName, { type: fileType });
        } else {
            const _blobPart: BlobPart[] = _.isArray(file) ? <BlobPart[]>file : <BlobPart[]>[file];
            const _blob = new Blob(_blobPart, { type: fileType });
            const _file: any = _blob;
            _file.lastModifiedDate = new Date();
            _file.name = fileName;
            return <File>_file;
        }
    }

    // encodeFile(filePath, sucess, failure) {
    //     var args: any = {};
    //     args.filePath = filePath;
    //     //handle android using native code because toDataURL is not supported on android version < 3

    //     var c = document.createElement('canvas');
    //     var ctx = c.getContext("2d");
    //     var img = new Image();

    //     img.onload = function (self, ev) {
    //         c.width = self.width;
    //         c.height = self.height;

    //         ctx.drawImage(img, 0, 0);

    //         var dataUri = c.toDataURL("image/png");

    //         sucess(dataUri);
    //         return;
    //     };
    //     img.src = filePath;
    // }
}
