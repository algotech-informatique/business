import { Pipe, PipeTransform } from '@angular/core';
import { WidgetDocumentFileDto } from '../dto/widget-document-file.dto';
import * as _ from 'lodash';

@Pipe({
    name: 'unhiddenFiles'
})
export class UnhiddenFilesPipe implements PipeTransform {

    constructor() {}

    transform(files: WidgetDocumentFileDto[]): WidgetDocumentFileDto[] {
        return _.filter(files, (file: WidgetDocumentFileDto) => !file.hidden);
    }

}
