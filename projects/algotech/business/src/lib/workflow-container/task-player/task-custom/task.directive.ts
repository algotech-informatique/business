import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[task-host]',
})
export class TaskDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}