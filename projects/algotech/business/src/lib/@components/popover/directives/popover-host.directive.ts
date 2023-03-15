import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[wf-popup-host]',
})
export class PopoverDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
