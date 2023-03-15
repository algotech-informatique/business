import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopoverDirective } from './directives/popover-host.directive';
import { PopoverComponent } from './popover.component';
@NgModule({
    imports: [
        CommonModule
    ],
    exports: [PopoverComponent],
    declarations: [PopoverComponent, PopoverDirective],
    providers: [],
})
export class PopoverModule { }
