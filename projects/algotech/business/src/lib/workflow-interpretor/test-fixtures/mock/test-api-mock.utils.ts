import { HttpTestingController } from '@angular/common/http/testing';
import { fixtSOEquipmentFromAPI, fixtSODocumentApi, fixtSOUserApi, fixtSmartObjects } from '../smart-objects';
import { workflowInstances } from '../workflow-instances';
import { WorkflowInstanceDto, WorkflowInstanceContextDto, SmartObjectDto } from '@algotech/core';
import * as _ from 'lodash';
import { fixtSmartModels } from '../smart-models';
import { fixtGlists } from '../genericlists';
import { AuthMockService } from './auth.mock.service';
import { environment } from '../../../../../../../../src/environments/environment';

export class TestUtils {
    public authService: AuthMockService;
    public httpMock: HttpTestingController;

    constructor(authService: AuthMockService, httpMock: HttpTestingController) {
        this.authService = authService;
        this.httpMock = httpMock;
    }

    signin(login: string, password: string, instance?: WorkflowInstanceDto) {
        return this.authService.signin(login, password, instance);
    }

    getContext(): WorkflowInstanceContextDto {
        return {
            user: this.authService.localProfil.user,
            apps: [],
            smartmodels: fixtSmartModels,
            glists: fixtGlists,
            groups: [],
            settings: null,
            custom: {
                indexes: {}
            }
        };
    }

    setContext(instance: WorkflowInstanceDto): WorkflowInstanceDto {
        return _.assign(_.cloneDeep(instance), { context: this.getContext() });
    }

    downloadSmartObjects() {
        for (const request of this.httpMock.match({
            method: 'POST',
            url: `${environment.API_URL}/smart-objects/subdoc?deep=1&excludeRoot=1`
        })) {
            request.flush([
                fixtSOEquipmentFromAPI,
                fixtSODocumentApi,
                fixtSOUserApi
            ]);
        }
    }

    downloadSmartObjectsFrom(smartObjects: SmartObjectDto[], local: SmartObjectDto[] = []) {
        setTimeout(() => {
            for (const so of smartObjects) {
                for (const request of this.httpMock.match(`${environment.API_URL}/smart-objects/${so.uuid}`)) {
                    request.flush(so);
                }
            }
            for (const so of local) {
                for (const request of this.httpMock.match(`${environment.API_URL}/smart-objects/${so.uuid}`)) {
                    const mockErrorResponse = { status: 400, statusText: 'Bad Request' };
                    const data = 'smart object unknon';
                    request.flush(data, mockErrorResponse);
                }
            }
        }, 500);
    }

    getWorkflowInstances() {
        setTimeout(() => {
            for (const wf of workflowInstances) {
                for (const request of this.httpMock.match(`${environment.API_URL}/workflow-instances/${wf.uuid}`)) {
                    request.flush(wf);
                }
            }
            for (const request of this.httpMock.match(`${environment.API_URL}/workflow-instances/not exist`)) {
                request.error(new ErrorEvent('error'));
            }
        }, 200);
    }

    getEquipments() {
        const request = this.httpMock.expectOne(`${environment.API_URL}/smart-objects/model/EQUIPMENT`);
        request.flush([fixtSOEquipmentFromAPI]);
    }

    getUser() {
        const request = this.httpMock.expectOne(`${environment.API_URL}/smart-objects/a14dc702-9a0e-46ec-bc1f-5adfd3ff7e4z`);
        request.flush(fixtSOUserApi);
    }

    save(error = false) {
        setTimeout(() => {
            for (const request of this.httpMock.match(`${environment.API_URL}/workflow-instances`)) {
                if (error) {
                    request.error(new ErrorEvent('error'));
                } else {
                    request.flush({});
                }
            }
        }, 500);
    }

    saveOperations() {
        setTimeout(() => {
            const requests: string[] = [];
            requests.push(`${environment.API_URL}/smart-objects`);

            for (const so of fixtSmartObjects) {
                requests.push(`${environment.API_URL}/smart-objects/${so.uuid}`);
                requests.push(`${environment.API_URL}/files/smart-object/${so.uuid}`);
            }

            for (const requestStr of requests) {
                for (const request of this.httpMock.match(requestStr)) {
                    request.flush({});
                    this.saveOperations();
                }
            }
        }, 500);
    }

    verify() {
        this.httpMock.verify();
    }
}
