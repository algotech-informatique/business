import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[widgetHost]',
})
export class AppWidgetDirective {
    constructor (
        public viewContainerRef: ViewContainerRef,
    ) { }
}
