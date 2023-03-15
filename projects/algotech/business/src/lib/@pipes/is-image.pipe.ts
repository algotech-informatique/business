import { Pipe, PipeTransform } from '@angular/core';
import { FilesService } from '../workflow-interpretor/@utils/files.service';

@Pipe({
    name: 'isImage'
})

export class IsImagePipe implements PipeTransform {

    constructor(private filesService: FilesService) {}
    transform(ext: string): any {
        return this.filesService.isImage(ext);
    }
}