import { WorkflowInterpretorService } from './workflow-interpretor.service';
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { PairDto, WorkflowInstanceDto, WorkflowModelDto } from '@algotech-ce/core';
import { fixtWorkflowModel1 } from './test-fixtures/workflow-models';
import {
    fixtWorkflowInstanceTodo, fixtWorkflowInstanceJumpedBeforeNotifyEmitter,
    fixtWorkflowInstanceJumpedBeforeUpload,
    fixtWorkflowInstanceBeforeFinish,
    fixtSettings
} from './test-fixtures/workflow-instances';
import {
    fixtInterpretorTaskUpload, fixtInterpretorFirstTask,
    fixtInterpretorTaskCheckNotifyReviewer, fixtInterpretorTaskFormDocument
} from './test-fixtures/interpretor-task';
import { fixtStackTaskNotifyReviewerOp, fixtStackTaskCheckNotifyReviewer } from './test-fixtures/stack-tasks';
import { fixtValidateFinished, fixtValidateUpload } from './test-fixtures/interpretor-validate';
import * as _ from 'lodash';
import {
    SettingsDataService, DataService,
} from '@algotech-ce/angular';
import {
    WorkflowErrorScheduled,
    WorkflowErrorUnauthorizedProfil,
    WorkflowErrorInstanceNotFind,
    WorkflowErrorJumped,
    WorkflowErrorOldInstance
} from '../../../interpretor/src/error/interpretor-error';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestUtils } from './test-fixtures/mock/test-api-mock.utils';
import { Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { from } from 'rxjs';
import { fixtSmartModels } from './test-fixtures/smart-models';
import { fixtGlists } from './test-fixtures/genericlists';
import { InterpretorFinisherDto, InterpretorTaskDto, InterpretorTypeJump } from '../../../interpretor/src/dto';
import { mergeMap } from 'rxjs/operators';
import { WorkflowInputMockBuilder } from './test-fixtures/mock/workflow-input-mock-builder';
import { fixtObjectDocumentToSo, fixtObjectEquipment, fixtObjectEquipmentToSo, fixtObjectUserToSo, fixtSOEquipmentFromAPI } from './test-fixtures/smart-objects';
import { AuthMockService } from './test-fixtures/mock/auth.mock.service';
import { AppTestModule } from './test-fixtures/mock/app.test.module';

const PREFIX_WORKFLOW_INSTANCE = 'wfi';
describe('WorkflowInterpretorService', () => {

    let workflowInterpretorService: WorkflowInterpretorService;
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

    beforeEach(inject([AuthMockService, DataService, SettingsDataService, WorkflowInterpretorService],
        async (
            authService: AuthMockService,
            dataService: DataService,
            settingsDataService: SettingsDataService,
            _workflowInterpretorService: WorkflowInterpretorService,) => {

            dataService.storage = storage;

            settingsDataService.workflows = [fixtWorkflowModel1];
            settingsDataService.smartmodels = fixtSmartModels;
            settingsDataService.glists = fixtGlists;

            workflowInterpretorService = _workflowInterpretorService;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');
        }));

    afterEach(async () => {
        await storage.clear();
    });

    it(`${WorkflowInterpretorService.prototype._initializeData.name} : should return result with no data when workflow has no variables and no inputs`, (done) => {
        // prepare data
        const workflow: WorkflowModelDto = _.cloneDeep(fixtWorkflowModel1);
        workflow.variables = [];

        const result = {
            smartobjects: [],
            data: [],
        };

        // test
        workflowInterpretorService._initializeData([], workflow, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );
    })

    it(`${WorkflowInterpretorService.prototype._initializeData.name} : should return result with no data when workflow has no variables but defined inputs`, (done) => {
        // prepare data
        const inputs: PairDto[] = [
            WorkflowInputMockBuilder.getInput('Hello World', 'string')
        ];
        const workflow: WorkflowModelDto = _.cloneDeep(fixtWorkflowModel1);
        workflow.variables = [];

        const result = {
            smartobjects: [],
            data: [],
        };

        // test
        workflowInterpretorService._initializeData(inputs, workflow, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );
    })

    it(`${WorkflowInterpretorService.prototype._initializeData.name} : should return result with data (set to null) when workflow has defined variables but no inputs`, (done) => {
        // prepare data
        const inputs: PairDto[] = [];
        const workflow: WorkflowModelDto = _.cloneDeep(fixtWorkflowModel1);
        workflow.variables = [
            WorkflowInputMockBuilder.getVariable('string', false, 'string')
        ];
        const result = WorkflowInputMockBuilder.getArrayResult([], workflow.variables, [null]);

        // test
        workflowInterpretorService._initializeData(inputs, workflow, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );
    })

    it(`${WorkflowInterpretorService.prototype._initializeData.name} : should return result with mixed data when variables define more than one type`, (done) => {
        // prepare data
        const inputs: PairDto[] = [
            WorkflowInputMockBuilder.getInput('Hello World', 'string'),
            WorkflowInputMockBuilder.getInput(['Hello World'], 'string-arr'),
            WorkflowInputMockBuilder.getInput('a1c7ce03-1589-43b3-9495-1321ec8ea86c', 'so-by-reference'),
            WorkflowInputMockBuilder.getInput(_.cloneDeep(fixtSOEquipmentFromAPI), 'so-by-dto'),
            WorkflowInputMockBuilder.getInput([_.cloneDeep(fixtObjectEquipment)], 'so-by-object'),
        ];

        const workflow: WorkflowModelDto = _.cloneDeep(fixtWorkflowModel1);
        workflow.variables = [
            WorkflowInputMockBuilder.getVariable('string', false, 'string'),
            WorkflowInputMockBuilder.getVariable('string', true, 'string-arr'),
            WorkflowInputMockBuilder.getVariable('so:EQUIPMENT', false, 'so-by-reference'),
            WorkflowInputMockBuilder.getVariable('so:EQUIPMENT', true, 'so-by-dto'),
            WorkflowInputMockBuilder.getVariable('so:EQUIPMENT', true, 'so-by-object'),
        ]

        const result = WorkflowInputMockBuilder.getArrayResult([
            fixtSOEquipmentFromAPI,
            fixtObjectUserToSo,
            fixtObjectDocumentToSo,
            fixtObjectEquipmentToSo
        ], workflow.variables, [
            'Hello World',
            ['Hello World'],
            'a1c7ce03-1589-43b3-9495-1321ec8ea86c',
            fixtSOEquipmentFromAPI.uuid,
            [fixtObjectEquipment.uuid]
        ]);

        // test
        workflowInterpretorService._initializeData(inputs, workflow, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(result);
                done();
            }
        );

        // api
        utils.downloadSmartObjectsFrom([fixtObjectEquipmentToSo, fixtObjectDocumentToSo, fixtObjectUserToSo]);
        utils.verify();
    })

    it(`${WorkflowInterpretorService.prototype._newInstance.name}`, (done) => {
        const res: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceTodo);

        workflowInterpretorService._newInstance(fixtWorkflowModel1, fixtSettings, [], utils.getContext()).subscribe(
            (instance: WorkflowInstanceDto) => {
                expect(instance.createdDate).not.toBeNull();
                expect(instance.updateDate).not.toBeNull();

                delete instance.createdDate;
                delete instance.updateDate;
                delete instance.uuid;
                delete instance.context;

                expect(res).toEqual(jasmine.objectContaining(instance));
                done();
            }
        );
    });

    it(`${WorkflowInterpretorService.prototype._checkScheduled.name} - no range date`, () => {
        expect(workflowInterpretorService._checkScheduled(fixtWorkflowInstanceTodo.rangeDate)).toBeTruthy();
    });

    it(`${WorkflowInterpretorService.prototype._checkScheduled.name} - only date start`, () => {
        const currentDate = new Date();
        const rangeDate = [new Date(currentDate.getFullYear() - 1, 11, 17).toISOString()];
        expect(workflowInterpretorService._checkScheduled(rangeDate)).toBeTruthy();
    });

    it(`${WorkflowInterpretorService.prototype._checkScheduled.name} - current date between range`, () => {
        const currentDate = new Date();
        const rangeDate = [new Date(currentDate.getFullYear() - 1, 11, 17).toISOString(),
        new Date(currentDate.getFullYear() + 1, 11, 17).toISOString()];
        expect(workflowInterpretorService._checkScheduled(rangeDate)).toBeTruthy();
    });

    it(`${WorkflowInterpretorService.prototype._checkScheduled.name} - current date outside range`, () => {
        const currentDate = new Date();
        const rangeDate = [new Date(currentDate.getFullYear() - 1, 11, 17).toISOString(),
        new Date(currentDate.getFullYear() - 1, 11, 17).toISOString()];
        expect(workflowInterpretorService._checkScheduled(rangeDate)).toBeFalsy();
    });

    it(`${WorkflowInterpretorService.prototype._checkScheduled.name} - incorrect format`, () => {
        const currentDate = new Date();
        const rangeDate = [new Date(currentDate.getFullYear() - 1, 11, 17).toISOString(),
        new Date(currentDate.getFullYear() - 1, 11, 17).toISOString(),
        new Date(currentDate.getFullYear() - 1, 11, 17).toISOString()];
        expect(() => { workflowInterpretorService._checkScheduled(rangeDate); }).toThrowError(WorkflowErrorScheduled);
    });

    it(`${WorkflowInterpretorService.prototype._loadInstance.name} - error scheduled`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);
        const currentDate = new Date();
        instance.rangeDate = [new Date(currentDate.getFullYear() - 1, 11, 17).toISOString(),
        new Date(currentDate.getFullYear() - 1, 11, 17).toISOString()];

        workflowInterpretorService._loadInstance(instance).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorScheduled).toBeTruthy();
                done();
            });
    });

    it(`${WorkflowInterpretorService.prototype._loadInstance.name} - error finished`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);
        instance.state = 'finished';

        workflowInterpretorService._loadInstance(instance).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorOldInstance).toBeTruthy();
                done();
            });
    });

    it(`${WorkflowInterpretorService.prototype._loadInstance.name} - error profil`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeNotifyEmitter);
        workflowInterpretorService._loadInstance(instance).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorUnauthorizedProfil).toBeTruthy();
                done();
            });
    });

    it(`${WorkflowInterpretorService.prototype._loadInstance.name} - load new instance - return the first task`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);
        const resCompare: InterpretorTaskDto = _.cloneDeep(fixtInterpretorFirstTask);
        delete resCompare.custom;
        resCompare.instance = instance;

        workflowInterpretorService._loadInstance(instance).subscribe(
            (res) => {
                expect(res).toEqual(
                    jasmine.objectContaining(resCompare)
                );
                done();
            }
        );
    });

    it(`${WorkflowInterpretorService.prototype._loadInstance.name} - load old instance - return old task`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeUpload);
        const resCompare: InterpretorTaskDto = _.cloneDeep(fixtInterpretorTaskUpload);
        delete resCompare.custom;
        resCompare.instance = instance;

        workflowInterpretorService._loadInstance(instance).subscribe(
            (res) => {
                expect(res).toEqual(
                    jasmine.objectContaining(resCompare)
                );
                done();
            }
        );
    });

    it(`${WorkflowInterpretorService.prototype.startWorkflow.name}`, (done) => {
        const resCompare: InterpretorTaskDto = _.cloneDeep(fixtInterpretorFirstTask);
        delete resCompare.custom;
        delete resCompare.instance;

        workflowInterpretorService.startWorkflow(fixtWorkflowModel1.key, fixtSettings, utils.getContext()).subscribe(
            (res) => {
                expect(res).toEqual(
                    jasmine.objectContaining(resCompare)
                );

                done();
            }
        );
    });

    it(`${WorkflowInterpretorService.prototype.runInstance.name} - instance not find`, (done) => {
        workflowInterpretorService.runInstance('not exist', null).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorInstanceNotFind).toBeTruthy();
                done();
            });

        utils.getWorkflowInstances();
    });

    it(`${WorkflowInterpretorService.prototype.runInstance.name} - instance find`, (done) => {
        const resCompare: InterpretorTaskDto = _.cloneDeep(fixtInterpretorTaskUpload);
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceJumpedBeforeUpload);
        delete resCompare.custom;
        delete resCompare.instance;

        from(storage.set(`${PREFIX_WORKFLOW_INSTANCE}-${instance.uuid}`, instance)).subscribe(() => {
            workflowInterpretorService.runInstance(instance.uuid, utils.getContext()).subscribe(
                (res) => {
                    expect(res).toEqual(
                        jasmine.objectContaining(resCompare)
                    );
                    done();
                }
            );
        });

        utils.getWorkflowInstances();
    });

    it(`${WorkflowInterpretorService.prototype.taskValidate.name}`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeUpload);

        const resCompare: InterpretorTaskDto = _.cloneDeep(fixtInterpretorTaskFormDocument);
        delete resCompare.custom;
        resCompare.instance = instance;

        workflowInterpretorService._loadInstance(instance).pipe(
            mergeMap(() => workflowInterpretorService.taskValidate(instance, fixtValidateUpload)),
        ).subscribe((res) => {
                expect(res).toEqual(
                    jasmine.objectContaining(resCompare)
                );
                done();
            }, (err) => { console.log(err); done(); }
        );
    });

    it(`${WorkflowInterpretorService.prototype.taskValidate.name} - before finished`, (done) => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceBeforeFinish);

        workflowInterpretorService._loadInstance(instance).pipe(
            mergeMap(() => workflowInterpretorService.taskValidate(instance, fixtValidateFinished))
        ).subscribe((res: InterpretorFinisherDto) => {
            expect(res instanceof InterpretorFinisherDto).toBeTrue();
            expect(res.instance.state).toBe('finished');

            expect(res.displayMode).toEqual('nothing');
            expect(res.outputTrigger).toEqual(InterpretorFinisherDto.DEFAULT_OUTPUT_TRIGGER);
            expect(res.save).toEqual(InterpretorFinisherDto.DEFAULT_SAVE);
            expect(res.timeout).toEqual(InterpretorFinisherDto.DEFAULT_TIMEOUT);
            expect(res.type).toEqual(InterpretorFinisherDto.DEFAULT_TYPE);

            done();
        });
    });

    it(`${WorkflowInterpretorService.prototype.taskJump.name} - failed`, (done) => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceBeforeFinish);

        workflowInterpretorService._loadInstance(instance).subscribe(() => {
            workflowInterpretorService.taskJump(instance, {
                direction: InterpretorTypeJump.Jump,
                uuid: fixtStackTaskNotifyReviewerOp.uuid
            }).subscribe(() => {
                Promise.reject(new Error());
                done();
            },
                (err) => {
                    expect(err instanceof WorkflowErrorJumped).toBeTruthy();
                    done();
                });
        });
    });

    it(`${WorkflowInterpretorService.prototype.taskJump.name} - success`, (done) => {
        const instance: WorkflowInstanceDto = utils.signin('jford', '123456', fixtWorkflowInstanceBeforeFinish);

        workflowInterpretorService._loadInstance(instance).subscribe(() => {
            workflowInterpretorService.taskJump(instance, {
                direction: InterpretorTypeJump.Jump,
                uuid: fixtStackTaskCheckNotifyReviewer.uuid
            }).subscribe((
                (res) => {
                    delete res.custom;
                    delete res.instance;

                    expect(fixtInterpretorTaskCheckNotifyReviewer).toEqual(
                        jasmine.objectContaining(res));
                    done();
                }
            ));
        });
    });
});

