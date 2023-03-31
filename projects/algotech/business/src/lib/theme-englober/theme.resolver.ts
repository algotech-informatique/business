import { AuthService, SettingsDataService, TranslateLangDtoService } from '@algotech-ce/angular';
import { ApplicationModelDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ThemeEngloberService } from './theme-englober.service';

@Injectable()
export class ThemeResolver implements Resolve<string> {
    constructor(
        private themeEngloberService: ThemeEngloberService,
        private authService: AuthService,
        private settingsDataService: SettingsDataService) { }

    resolve(
        route: ActivatedRouteSnapshot,
    ): Observable<any> | Promise<any> | any {
        if (this.authService.isAuthenticated && this.settingsDataService?.settings) {
            const findApp: ApplicationModelDto = this.settingsDataService?.apps?.find((app) => app.key === route.paramMap.get('keyApp'));
            if (findApp?.snApp?.theme) {
                this.themeEngloberService?.theme?.next(findApp.snApp.theme);
            } else {
                this.themeEngloberService?.theme?.next(this.settingsDataService.settings.theme)
            }

            return of(true);
        }
        return of(false);

    }
}
