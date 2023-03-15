import { Injectable } from '@angular/core';
import { AuthService, EnvService, SmartFlowsService } from '@algotech/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { InterpretorService } from '../../../../../interpretor/src/interpretor-reader/interpretor-task/interpretor-service';
import { ServiceReturnModelDto } from '@algotech/core';
import { SmartObjectDto, PairDto } from '@algotech/core';
import { defer, Observable, throwError } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { ATHttpException } from '../../../../../interpretor/src/error/http-exception';
import { InterpretorFormData } from '../../../../../interpretor/src';

@Injectable()
export class WorkflowServiceService extends InterpretorService {

    constructor(
        protected authService: AuthService,
        protected http: HttpClient,
        protected env: EnvService,
        private smartFlowsService: SmartFlowsService,
    ) {
        super();
        env.environment.subscribe((e) => this.api = e.API_URL);
    }

    serviceConnection(route: string, headers: HttpHeaders, body: object, type: string, responseType: 'text' | 'blob' = 'text'): Observable<any> {
        let obs: Observable<any> = null;
        let options: any = { headers, responseType };
        switch (type) {
            case 'GET':
                obs = this.http.get<any>(route, options);
                break;
            case 'POST':
                obs = this.http.post<any>(route, body, options);
                break;
            case 'PUT':
                obs = this.http.put<any>(route, body, options);
                break;
            case 'PATCH':
                obs = this.http.patch<any>(route, body, options);
                break;
            case 'DELETE': {
                options = { headers };
                if (body) {
                    options['body'] = body;
                }
                obs = this.http.delete<any>(route, options);
                break;
            }
        }
        return obs.pipe(
            map((data) => {
                try {
                    return (responseType === 'text') ?
                        JSON.parse(data)
                        : {
                            fileName: data.name,
                            mimeType: data.type,
                            data,
                        }
                } catch (e) {
                    return data;
                }
            })
        );
    }

    call(url: string, headers: PairDto[], body: InterpretorFormData, type: 'get' | 'patch' | 'post' | 'put' | 'delete' | 'update', responseType: 'text' | 'blob' = 'text'): Observable<any> {
        return defer(() => {
            const heads: HttpHeaders = this.getHeaders(headers);
            if ((body.type === 'formData') || (responseType === 'blob')) {
                const formData = new FormData();
                for (const element of body.data) {
                    if (element.fileName) {
                        formData.append(element.key, element.value, element.fileName)
                    } else {
                        formData.append(element.key, element.value);
                    }
                }
                return (responseType === 'blob') ?
                    this.serviceConnection(url, heads, body, type.toUpperCase(), responseType) :
                    this.serviceConnection(url, heads, formData, type.toUpperCase(), responseType);
            }
            return this.smartFlowsService.callApi({ url, headers, body, type: type.toUpperCase() });
        }).pipe(
            catchError((e) => {
                return throwError(new ATHttpException(url, e.status, e.error, e.statusText));
            })
        )
    }

    callATService(route: string, body: object, type: string, typeReturn: ServiceReturnModelDto, smartObjects: SmartObjectDto[]):
        Observable<any> {
        return this.obsHeaders()
            .pipe(
                mergeMap((headers: HttpHeaders) => {
                    const obs: Observable<any> = this.serviceConnection(route, headers, body, type);
                    return obs.pipe(
                        map((res: any) => {
                            return this.mergeSmartObjectWithLocalData(res, typeReturn, smartObjects);
                        })
                    );
                }),
                catchError((error: HttpErrorResponse) => this.handleError(this.callATService(route,
                    body, type, typeReturn, smartObjects), error))
            );
    }

    protected obsHeaders(): Observable<HttpHeaders> {

        return new Observable((observer) => {
            let key: String = '';
            if (this.authService.isAuthenticated) {
                key = this.authService.localProfil.key;
            }

            let headers = new HttpHeaders();
            headers = headers.append('Accept', 'application/json');
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', `Bearer ${key}`);

            observer.next(headers);
        });
    }

    protected getHeaders(headers: PairDto[]): HttpHeaders {
        let heads = new HttpHeaders();
        _.forEach(headers, (header: PairDto) => {
            heads = heads.append(header.key, header.value);
        });
        return heads;
    }

    protected transformErr(error: HttpErrorResponse) {
        let message = error.message;
        if (error instanceof HttpErrorResponse && error.error) {
            let parseError: any;
            try {
                parseError = JSON.parse(error.error);
            } catch (e) {
                parseError = e.error;
            }
            if (parseError?.message) {
                const value = parseError.message;
                message = _.isObject(value) ? JSON.stringify(value) : value;
            }
        }
        return throwError(() => new Error(message));
    }

    protected handleError(req: Observable<any>, error: HttpErrorResponse): Observable<any> {
        if (error.status === 401) {
            return this.authService.updateToken().pipe(
                mergeMap(
                    () => {
                        // Reload route
                        return req.pipe(

                        );
                    }
                ),
                catchError((e: HttpErrorResponse) => this.transformErr(e))
            );
        } else if (error.status === 304) {
            return throwError(() => error);
        } else {
            return this.transformErr(error);
        }
    }
}
