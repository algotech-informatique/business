import { SnPageDto } from '@algotech-ce/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'spacingFooter' })
export class spacingFooterPipe implements PipeTransform {

    transform(page: SnPageDto): string {
        return `${page?.pageHeight - page?.footer?.box?.height - page?.header?.box?.height - 1}px`;
    }

}
