import { PairDto } from '@algotech-ce/core';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class EncodeGuard implements CanActivate {

    constructor(
        private router: Router,
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const hasQueryParams = Object.entries(route.queryParams).length > 0;
        if (hasQueryParams) {
            const inputsPairs: PairDto[] = Object.entries(route.queryParams).map(([key, value]) => ({ key, value }));
            let inputs = window.btoa(encodeURIComponent(JSON.stringify(inputsPairs)));
            inputs = encodeURIComponent(inputs);
            this.router.navigate([state.url.split('?')[0] , { inputs }], { replaceUrl: true });
        }
        return true;
    }

}