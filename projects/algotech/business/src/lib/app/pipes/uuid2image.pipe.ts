import { FilesService } from './../../workflow-interpretor/@utils/files.service';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'uuid2image' })
export class Uuid2ImagePipe implements PipeTransform {

    constructor(private filesService: FilesService) {}

    transform(imageUuid: string): string {
        return imageUuid ? this.filesService.getURL(imageUuid, true, false) : '';
    }
}
