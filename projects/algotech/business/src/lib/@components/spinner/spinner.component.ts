import { Component } from '@angular/core';
@Component({
    selector: 'spinner',
    template: `
    <div class="loading">
        <div class="loadingAnimation"></div>
    </div>`,
    styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
}
