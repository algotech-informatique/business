import { SnPageWidgetDto } from '@algotech/core';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'whiteSpace' })
export class WhiteSpacePipe implements PipeTransform {
    transform(height: number, css: any): any {
        const fontSizeCss = css?.text['font-size'];
        if (!css) {
            return { 'white-space': 'pre-wrap' };
        }
        const fontSize = +fontSizeCss.replace('px', '');
        return ((fontSize * 2) + 10) >= height ?
            { 'white-space': 'nowrap'} :
            { 'white-space': 'pre-wrap' };
    }
}
