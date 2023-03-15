import { Observable } from 'rxjs';

export interface EventResolver {
    key: string;
    action$: (UIEvent?: Event) => Observable<any>;
}
