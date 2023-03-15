import { AuthService, LocalProfil } from '@algotech/angular';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WorkflowLaunchService } from '../workflow-launcher/workflow-layout.lancher.service';

@Injectable({ providedIn: 'root' })
export class AuthDebugService {
    constructor(private authService: AuthService, private workflowLauncher: WorkflowLaunchService) { }

    public overrideGetterLocalProfil(localProfil: LocalProfil) {
        this.authService.keycloakService.getKeycloakInstance().refreshToken = localProfil.refresh;
        return from(this.authService.keycloakService.updateToken(20))
            .pipe(
                tap(() => {
                    Object.defineProperty(AuthService.prototype, 'localProfil', {
                        get: () => {
                            const ki: Keycloak.KeycloakInstance = this.authService.keycloakService.getKeycloakInstance();
                            return Object.assign(_.cloneDeep(localProfil), { key: ki.token, refresh: ki.refreshToken });
                        },
                    });

                    this.workflowLauncher.setCurrentUser();
                })
            );
    }
}