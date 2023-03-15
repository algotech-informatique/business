import { AfterViewInit, ChangeDetectorRef, Component, HostBinding, Input, OnChanges } from '@angular/core';
import { GridConfigurationDto } from '../../dto/grid-configuration.dto';

@Component({
    selector: 'at-grid-group',
    styleUrls: ['./grid-group.component.scss'],
    template: `
        <div class="content">
            <ng-content></ng-content>
        </div>
    `
})

export class GridGroupComponent implements OnChanges {
    @HostBinding('class') class = 'none';

    @Input()
    sticky: 'left' | 'right' | 'none';

    constructor(private ref: ChangeDetectorRef) {}

    ngOnChanges() {
        this.class = this.sticky;
        this.ref.detectChanges();
    }
}