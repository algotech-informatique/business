import { SysFile } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'mathjs';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CameraFile } from '../dto/camera-file.dto';
import { FileAssetDto } from '../dto/file-asset.dto';
import { FilesService } from '../workflow-interpretor/@utils/files.service';

@Pipe({
    name: 'sysFileToUri'
})

export class SysFileToUriPipe implements PipeTransform {

    constructor(private filesService: FilesService) {}

    transform(file: CameraFile, thumbnail = ''): any {
        if (file.file) {
            return this.filesService._readFileToBase64(file.file);
        }
        return this.filesService.getAsset(file.versionID).pipe(
            mergeMap((asset: FileAssetDto) => {
                if (asset) {
                    return this.filesService._readFileToBase64(asset.file);
                }
                return of(this.filesService.getURL(file.versionID, true, true, thumbnail));
            }),
        );
    }
}