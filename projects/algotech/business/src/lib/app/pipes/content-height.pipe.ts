import { SnPageWidgetDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'contentHeight' })
export class ContentHeightPipe implements PipeTransform {

    transform(footer: SnPageWidgetDto, scale: number): string {
        return footer ? `${footer.box.y * scale}px` : '100%';
    }

}
