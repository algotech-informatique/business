import { SettingsDataService } from '@algotech-ce/angular';
import { PairDto, ThemeDto } from '@algotech-ce/core';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeEngloberService } from './theme-englober.service';
@Component({
    selector: 'at-theme-englober',
    styleUrls: ['./theme-englober.component.scss'],
    template: `
        <div class="content" #content>
            <ng-content></ng-content>
        </div>
    `
})

export class ThemeEngloberComponent implements AfterViewInit, OnDestroy {
    @ViewChild('content') content: ElementRef;

    constructor(private themeEnglober: ThemeEngloberService) {
    }
    subscription: Subscription;
    ngAfterViewInit() {
        this.subscription = this.themeEnglober.theme.subscribe((theme: ThemeDto) => {
            let colors: PairDto[] = this.themeEnglober.lightTheme;
            if (theme) {
                switch (theme.themeKey) {
                    case 'light':
                        colors = this.themeEnglober.lightTheme;
                        break;
                    case 'dark':
                        colors = this.themeEnglober.darkTheme;
                        break;
                    case 'custom':
                        colors = theme.customColors;
                        break;
                }
            }

            const bgValue = colors.find((c) => c.key === 'BACKGROUND')?.value;
            for (const color of colors) {
                this.content.nativeElement.style.setProperty(`--ALGOTECH-${color.key}`, color.value);
                this.content.nativeElement.style.setProperty(`--ALGOTECH-${color.key}-SHADE`, this.themeEnglober.shade(color.value));
                this.content.nativeElement.style.setProperty(`--ALGOTECH-${color.key}-TINT`, this.themeEnglober.tint(color.value));
                this.content.nativeElement.style.setProperty(`--ALGOTECH-${color.key}-BORDER`, this.themeEnglober.border(color.value));
                this.content.nativeElement.style.setProperty(`--ALGOTECH-${color.key}-HOVER`, this.themeEnglober.hover(bgValue, color.value));
            }
            this.content.nativeElement.style.setProperty(`--ALGOTECH-BACKGROUND-CONTENT`, this.themeEnglober.background(bgValue));
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
