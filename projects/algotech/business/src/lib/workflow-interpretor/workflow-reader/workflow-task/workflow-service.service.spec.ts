import { TestBed, inject } from '@angular/core/testing';
import { fixtSmartModels } from '../../test-fixtures/smart-models';
import * as _ from 'lodash';
import {
    SettingsDataService,
} from '@algotech-ce/angular';
import { fixtGlists } from '../../test-fixtures/genericlists';
import { AppModule } from '../../../../../../../../src/app/app.module';
import { WorkflowContainerModule } from '../../../workflow-container/workflow-container.module';
import { WorkflowServiceService } from './workflow-service.service';
import { PairDto } from '@algotech-ce/core';
import { fixtWorkflowDeprecatedServiceSearch, fixtWorkflowServiceConnector, fixtWorkflowServiceSearch } from '../../test-fixtures/workflow-service';
import { WorkflowTaskService } from './workflow-task.service';
import { environment } from '../../../../../../../../src/environments/environment';
import { CustomResolverParams } from '../../../../../interpretor/src';

describe(WorkflowTaskService.name, () => {
    let workflowServiceService: WorkflowServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppModule, WorkflowContainerModule],
        });
    });

    beforeEach(inject([SettingsDataService, WorkflowServiceService],
        async (
            settingsDataService: SettingsDataService,
            _workflowServiceService: WorkflowServiceService) => {

            workflowServiceService = _workflowServiceService;

            settingsDataService.smartmodels = fixtSmartModels;
            settingsDataService.glists = fixtGlists;
        }));

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should complete route with url-segment from params`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowDeprecatedServiceSearch);
            const values = ['machine', '', '', '', '', '', ''];
            const params: CustomResolverParams = {
                searchParameters: {
                    skip: 10,
                    limit: 100,
                    search: 'world'
                }
            };

            // test
            expect(workflowServiceService._prepareRoute(service, values, params)).toEqual(`${environment.API_URL}/smart-objects/search/machine?property=&value=world&defaultOrder=&order=&skip=10&limit=100`);
        });

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should complete route with url-segment from values`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowDeprecatedServiceSearch);
            const values = ['machine', '', 'world', '', '', 10, 100];

            // test
            expect(workflowServiceService._prepareRoute(service, values, {})).toEqual(`${environment.API_URL}/smart-objects/search/machine?property=&value=world&defaultOrder=&order=&skip=10&limit=100`);
        });

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should complete route with url-segment from values and params`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowDeprecatedServiceSearch);
            const values = ['machine', '', 'world', '', '', 10, 100];
            const params: CustomResolverParams = {
                searchParameters: {
                    search: 'hello'
                }
            };

            // test
            expect(workflowServiceService._prepareRoute(service, values, params)).toEqual(`${environment.API_URL}/smart-objects/search/machine?property=&value=hello&defaultOrder=&order=&skip=10&limit=100`);
        });

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should complete body with searchParameters`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowServiceConnector);
            const values = ['paul-create-machine', []];
            const params: CustomResolverParams = {
                searchParameters: {
                    skip: 10,
                    limit: 100,
                    search: 'world'
                }
            };

            // test
            expect(workflowServiceService._prepareBody(service, values, false, params)).toEqual({
                key: 'paul-create-machine',
                inputs: [],
                readonly: false,
                searchParameters: {
                    skip: 10,
                    limit: 100,
                    search: 'world'
                }
            });
        });

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should complete body with request-body`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowServiceSearch);
            const values = ['toto', [{
                key: 'NAME',
                value: 'desc'
            }], []];

            // test
            expect(workflowServiceService._prepareBody(service, values, false)).toEqual({
                modelKey: 'toto',
                filter: [{
                    key: 'NAME',
                    value: 'desc'
                }],
                order: [],
            });
        });

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should set readonly to false when route is connector`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowServiceConnector);
            const values = ['toto', [{
                key: 'toto',
                value: 'titi'
            }]];

            // test
            expect(workflowServiceService._prepareBody(service, values, false)).toEqual({
                key: 'toto',
                inputs: [{
                    key: 'toto',
                    value: 'titi'
                }],
                readonly: false,
            });
        });

        it(`${WorkflowServiceService.prototype._prepareRoute.name} should set readonly to true when route is connector`, () => {
            // prepare data
            const service = _.cloneDeep(fixtWorkflowServiceConnector);
            const values = ['toto', [{
                key: 'toto',
                value: 'titi'
            }]];

            // test
            expect(workflowServiceService._prepareBody(service, values, true)).toEqual({
                key: 'toto',
                inputs: [{
                    key: 'toto',
                    value: 'titi'
                }],
                readonly: true,
            });
        });
});
