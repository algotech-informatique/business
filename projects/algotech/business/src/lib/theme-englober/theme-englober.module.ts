import { NgModule } from '@angular/core';
import { ThemeEngloberComponent } from './theme-englober.component';
import { ThemeEngloberService } from './theme-englober.service';
import { ThemeResolver } from './theme.resolver';

@NgModule({
    imports: [],
    declarations: [
        ThemeEngloberComponent,
    ],
    providers: [
        ThemeEngloberService,
        ThemeResolver
    ],
    exports: [
        ThemeEngloberComponent
    ]
})
export class ThemeEngloberModule { }
