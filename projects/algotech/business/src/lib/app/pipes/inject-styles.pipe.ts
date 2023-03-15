import { SnPageWidgetDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'injectStyle' })
export class InjectStylePipe implements PipeTransform {

    transform(css: any, className: string[]): any {
        let res = {};
        for (const name of className) {
            if (css[name]) {
                res = { ...res, ...css[name] };
            }
        }
        return res;
    }
}
