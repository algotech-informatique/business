import { SnPageDto, SnPageWidgetDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';
import { PageUtilsService } from '../services/page-utils.service';

@Pipe({ name: 'absolutePosition' })
export class AbsolutePositionPipe implements PipeTransform {

    constructor(private pageUtils: PageUtilsService) {}

    transform(widget: SnPageWidgetDto, snPage: SnPageDto): any {
        const box = this.pageUtils.transformAbsolute(null, widget, snPage).box;
        return {
            [box.x > snPage.pageWidth / 2 ? 'right' : 'left']: '0px', 
            [box.y > snPage.pageHeight / 2 ? 'bottom' : 'top']: `${box.height + 10}px`,
        };
    }

}
