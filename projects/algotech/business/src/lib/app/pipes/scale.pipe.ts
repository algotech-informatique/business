import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'scale' })
export class ScalePipe implements PipeTransform {

    transform(width: number, maxWidth: number): number {
        return (width / maxWidth);
    }
}
