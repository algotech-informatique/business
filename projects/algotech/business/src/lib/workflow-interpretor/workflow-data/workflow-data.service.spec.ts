import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { WorkflowDataService } from '../workflow-data/workflow-data.service';
import { WorkflowDataApiService } from '../workflow-data/workflow-data-api.service';
import { WorkflowDataStorageService } from '../workflow-data/workflow-data-storage.service';
import { fixtWorkflowModel1 } from '../test-fixtures/workflow-models';
import {
    fixtWorkflowInstanceTodo,
    fixtWorkflowInstanceReverseApiTagBefore,
    fixtWorkflowInstanceBeforeFinish,
} from '../test-fixtures/workflow-instances';
import { WorkflowInstanceDto } from '@algotech/core';
import * as _ from 'lodash';
import { HttpTestingController } from '@angular/common/http/testing';
import { DataService, SettingsDataService } from '@algotech/angular';
import { TestUtils } from '../test-fixtures/mock/test-api-mock.utils';
import { Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { FilesService } from '../../workflow-interpretor/@utils/files.service';
import { fixtSmartModels } from '../test-fixtures/smart-models';
import { fixtGlists } from '../test-fixtures/genericlists';
import { WorkflowErrorModelNotFind,
    WorkflowErrorInstanceNotFind } from '../../../../interpretor/src/error/interpretor-error';
import { mergeMap } from 'rxjs/operators';
import { AuthMockService } from '../test-fixtures/mock/auth.mock.service';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';

const PREFIX_WORKFLOW_INSTANCE = 'wfi';

describe('WorkflowDataService', () => {
    let workflowDataService: WorkflowDataService;
    let workflowDataStorageService: WorkflowDataStorageService;
    let workflowDataApiService: WorkflowDataApiService;
    let filesService: FilesService;
    let storage: Storage;
    let utils: TestUtils;

    beforeAll((done) => {
        storage = new Storage({
            name: '__workflowTest',
            storeName: 'keyvaluepairs',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
        });
        storage.create().then(() => done());
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([AuthMockService, DataService, SettingsDataService, WorkflowDataStorageService, WorkflowDataApiService, WorkflowDataService,
        FilesService],
        async (
            authService: AuthMockService,
            dataService: DataService,
            settingsDataService: SettingsDataService,
            _workflowDataStorageService: WorkflowDataStorageService,
            _workflowDataApiService: WorkflowDataApiService,
            _workflowDataService: WorkflowDataService,
            _filesService: FilesService) => {

            dataService.storage = storage;

            settingsDataService.workflows = [fixtWorkflowModel1];
            settingsDataService.smartmodels = fixtSmartModels;
            settingsDataService.glists = fixtGlists;

            workflowDataStorageService = _workflowDataStorageService;
            workflowDataApiService = _workflowDataApiService;
            workflowDataService = _workflowDataService;
            filesService = _filesService;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');
        }));

    afterEach(async () => {
        try {
            await storage.clear();
        } catch (e) {}
    });

    it('getModel', (done) => {
        workflowDataService.getModel(fixtWorkflowModel1.key, null).subscribe(
            (res) => {
                expect(res).toEqual(fixtWorkflowModel1);
                done();
            }
        );
    });

    it('getModel - not exist', (done) => {
        workflowDataService.getModel('not exist', null).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorModelNotFind).toBeTruthy();
                done();
            });
    });

    it('getInstance - storage - not exist', (done) => {
        workflowDataStorageService.getInstance('not exist').subscribe(
            (res) => {
                expect(res).toBeNull();
                done();
            }
        );
    });

    it('getInstance - storage - exist', (done) => {
        storage.set(`${PREFIX_WORKFLOW_INSTANCE}-${fixtWorkflowInstanceTodo.uuid}`, fixtWorkflowInstanceTodo).then(
            () => {
                workflowDataStorageService.getInstance(fixtWorkflowInstanceTodo.uuid).subscribe(
                    (res) => {
                        expect(res).toEqual(fixtWorkflowInstanceTodo);
                        done();
                    }
                );
            }
        );
    });

    it('getInstance - api - not exist', (done) => {
        workflowDataApiService.getInstance('not exist').subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof Error).toBeTruthy();
                done();
            });

        utils.getWorkflowInstances();
    });

    it('getInstance - api - exist', (done) => {
        workflowDataApiService.getInstance(fixtWorkflowInstanceTodo.uuid).subscribe(
            (res) => {
                expect(res).toEqual(fixtWorkflowInstanceTodo);
                done();
            }
        );

        utils.getWorkflowInstances();
    });

    it('getInstance - exist in storage', (done) => {
        storage.set(`${PREFIX_WORKFLOW_INSTANCE}-${fixtWorkflowInstanceTodo.uuid}`, fixtWorkflowInstanceTodo).then(
            () => {
                workflowDataService.getInstance(fixtWorkflowInstanceTodo.uuid, utils.getContext()).subscribe(
                    (res) => {
                        expect(res).toEqual(utils.setContext(fixtWorkflowInstanceTodo));
                        done();
                    }
                );
            }
        );

        utils.getWorkflowInstances();
    });

    it('getInstance - not exist', (done) => {
        workflowDataService.getInstance('not exist', null).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorInstanceNotFind).toBeTruthy();
                done();
            });

        utils.getWorkflowInstances();
    });

    it('save - api - success', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceReverseApiTagBefore);
        instance.settings.savingMode = 'ASAP';
        instance.stackTasks[1].operations[1].requireInstance = true;

        filesService.setAsset({
            file: new File([], 'test.txt', { type: 'text/plain' }),
            infoFile: {
                versionID: '7b8cb8b3-9132-4da0-ba49-f1244994a443',
                dateUpdated: '',
                documentID: '',
                ext: '',
                name: '',
                reason: '',
                size: 0,
                tags: [],
                metadatas: [],
                user: ''
            },
            private: true,
            saved: false,
        }).pipe(
            mergeMap(() => workflowDataService.save(instance)),
        ).subscribe(() => {
            done();
        });

        utils.save(false);
        utils.saveOperations();
    });


    it('save - api - failed', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceReverseApiTagBefore);
        instance.settings.savingMode = 'ASAP';
        instance.stackTasks[1].operations[1].requireInstance = true;

        workflowDataService.save(instance).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof Error).toBeTruthy();
                done();
            });

        utils.save(true);
    });

    it(`${WorkflowDataService.prototype.save.name} : should retun instance whithout saving`, (done) => {
        // prepare data
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);
        instance.settings.savingMode = 'DEBUG';

        // test
        workflowDataService.save(instance).subscribe((res: WorkflowInstanceDto) => {
            expect(res).toEqual(instance);
            expect(res.stackTasks[instance.stackTasks.length - 1].saved).toBeFalse();
            done();
        });
    });
});
