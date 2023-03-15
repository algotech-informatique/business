import { UserDto, WorkflowInstanceDto } from '@algotech/core';
import { Injectable } from '@angular/core';
import { fixtGlists } from '../genericlists';
import { fixtSmartModels } from '../smart-models';
import { fixtSignInMock } from './signin';
import * as _ from 'lodash';
import { LocalProfil } from '@algotech/angular';
import { Observable, of } from 'rxjs';

@Injectable()
export class AuthMockService {
    private _user: UserDto;

    public initialize(clientId: string, origin: string, keyCloakurl?: string, realm?: string): Observable<boolean> {
        return of(true);
    }

    signin(login: string, password: string, instance?: WorkflowInstanceDto) {
        const flush = fixtSignInMock.find((signin) => signin.user.username === login);
        this._user = flush.user;

        if (instance) {
            return _.assign(_.cloneDeep(instance), {
                context: {
                    user: flush.user,
                    smartmodels: fixtSmartModels,
                    glists: fixtGlists,
                    groups: [],
                    settings: null,
                }
            });
        }
        return null;
    }

    get localProfil(): LocalProfil {
        const user = this._user ? this._user : fixtSignInMock[0].user;

        const localProfil: LocalProfil = {
            id: 'aaa',
            key: 'zzz',
            refresh: 'zzz',
            login: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            pictureUrl: '',
            preferedLang: user.preferedLang,
            groups: user.groups,
            password: '',
            user
        }

        return localProfil;
    }

    get isAuthenticated(): boolean {
        return true;
    }
}