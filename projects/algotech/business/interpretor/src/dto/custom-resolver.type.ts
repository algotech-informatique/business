import { PairDto } from '@algotech-ce/core';
import { Observable } from 'rxjs';
import { CustomResolverParams } from './custom-resolver-params.dto';

export type CustomResolver<T> = (params?: CustomResolverParams) => Observable<T>;
