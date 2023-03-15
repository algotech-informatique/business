import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[so-form-host]',
})
export class SoFormDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
