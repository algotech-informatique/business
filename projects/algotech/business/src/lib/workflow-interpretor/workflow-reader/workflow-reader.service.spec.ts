import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { WorkflowReaderService } from './workflow-reader.service';
import {
    fixtStackTaskNotifyEmitter,
    fixtStackTaskSelect,
    fixtStackTaskCheckNotifyReviewer,
    fixtStackTaskNotifyAll01,
    fixtStackTaskNotifyReviewerOp,
    fixtStackTaskForm,
    fixtStackTaskNewDocumentOp,
    fixtStackTaskUpload
} from '../test-fixtures/stack-tasks';
import {
    fixtWorkflowInstanceTodo,
    fixtWorkflowInstanceCheckReviewers,
    fixtWorkflowInstanceBeforeLoop,
    fixtWorkflowInstanceBeforeFinish,
    fixtWorkflowInstanceJumped,
    fixtWorkflowInstanceJumpedBeforeNotifyReviewer,
    fixtWorkflowInstanceJumpedBeforeUpload,
    fixtWorkflowInstanceUpload,
    fixtWorkflowInstanceReverseApiTagBefore,
    fixtWorkflowInstanceReverseApiTagAfter,
    fixtWorkflowInstanceNewDocument,
    fixtWorkflowInstanceJumpedBeforeNewDocument,
    fixtWorkflowInstanceForm,
    fixtWorkflowInstanceSelect,
    fixtWorkflowInstanceSelectAfterJump
} from '../test-fixtures/workflow-instances';
import {
    fixtValidateJumpWrite,
    fixtValidateUpload,
    fixtValidateNewDocument,
    fixtValidateUpload02,
    fixtValidateObject
} from '../test-fixtures/interpretor-validate';
import {
    fixtSOEquipment_01,
    fixtSODocument_NEW,
    fixtSODocument_02,
    fixtSODocument_01,
    fixtSODocument_01_update
} from '../test-fixtures/smart-objects';
import { fixtInterpretorTaskUpload } from '../test-fixtures/interpretor-task';
import {
    fixtOperationsUpload,
    fixtReverseNotifyEmitter,
    fixtOperationsNewDocument,
    fixtReverseNewDocument,
    fixtOperationsNotifyEmitter,
    fixReverseOperationUpload
} from '../test-fixtures/operations';
import * as _ from 'lodash';
import { WorkflowInstanceDto, WorkflowStackTaskDto, CrudDto, TaskModelDto } from '@algotech/core';
import {
    SettingsDataService, DataService,
} from '@algotech/angular';
import { HttpTestingController } from '@angular/common/http/testing';
import { WorkflowUtilsService } from '../workflow-utils/workflow-utils.service';
import { TestUtils } from '../test-fixtures/mock/test-api-mock.utils';
import { Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { fixtSmartModels } from '../test-fixtures/smart-models';
import { fixtGlists } from '../test-fixtures/genericlists';
import { WorkflowErrorUnauthorizedProfil, WorkflowErrorJumped } from '../../../../interpretor/src/error/interpretor-error';
import { InterpretorTypeJump } from '../../../../interpretor/src/dto';
import { mergeMap } from 'rxjs/operators';
import { AuthMockService } from '../test-fixtures/mock/auth.mock.service';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';

describe('WorkflowReaderService', () => {

    let workflowReaderService: WorkflowReaderService;
    let workflowUtilsService: WorkflowUtilsService;
    let utils: TestUtils;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([AuthMockService, DataService, SettingsDataService, WorkflowUtilsService, WorkflowReaderService],
        async (
            authService: AuthMockService,
            dataService: DataService,
            settingsDataService: SettingsDataService,
            _workflowUtilsService: WorkflowUtilsService,
            _workflowReaderService: WorkflowReaderService) => {

            dataService.storage = new Storage({
                name: '__workflowTest',
                storeName: 'keyvaluepairs',
                driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
            });
            await dataService.storage.create();
            settingsDataService.smartmodels = fixtSmartModels;
            settingsDataService.glists = fixtGlists;

            workflowUtilsService = _workflowUtilsService;
            workflowReaderService = _workflowReaderService;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');
        }));

    it('createNextTask - first task', () => {
        const res = {
            active: false,
            operations: [],
            reverse: [],
            saved: false,
            taskModel: '6b443bbe-1b2d-11e9-ab14-d663bd873d93',
        };
        const instance = _.cloneDeep(fixtWorkflowInstanceTodo);

        expect(workflowReaderService._createNextTask(instance).task).toEqual(
            jasmine.objectContaining(res),
        );
    });

    it('createNextTask - by transition', () => {
        const instance = _.cloneDeep(fixtWorkflowInstanceCheckReviewers);
        const stackTask = workflowReaderService._createNextTask(instance, 'ok').task as WorkflowStackTaskDto;
        expect(stackTask.taskModel).toBe('2adafc78-1b2f-11e9-ab14-d663bd873d93');
    });

    it('createNextTask - before finished (with finisher)', () => {
        // prepare data
        const instance = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        const nextTask = workflowReaderService._createNextTask(instance, 'notify');
        const step = instance.workflowModel.steps.find((s) => s.key === 'review');
        const finisher = step.tasks.find((t) => t.type === 'TaskFinisher');

        // test
        expect((nextTask.task as WorkflowStackTaskDto).taskModel).toBe(finisher.uuid);
        expect(nextTask.state).toBe('running');
    });

    it('createNextTask - before finished (without finisher)', () => {
        // prepare data
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceBeforeFinish);
        const step = instance.workflowModel.steps.find((s) => s.key === 'review');
        const finisher = step.tasks.find((t) => t.type === 'TaskFinisher');
        const beforeFinisher = step.tasks.find((t) => t.properties.transitions[0].task === finisher.uuid);

        beforeFinisher.properties.transitions[0].task = null;
        _.remove(step.tasks, (t: TaskModelDto) => t.type === 'TaskFinisher');

        // test
        const nextTask = workflowReaderService._createNextTask(instance, 'notify');
        expect(nextTask.task).toBeUndefined();
        expect(nextTask.state).toBe('finished');
    });

    it('activeNext', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumped);
        const indexActive = fixtWorkflowInstanceJumped.stackTasks.findIndex((s) => s.active);

        workflowReaderService._activeNext(instance);

        expect(instance.stackTasks[indexActive].active).toBeFalsy();
        expect(instance.stackTasks[indexActive + 1].active).toBeTruthy();
    });

    it('updateStack - check push and active', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceCheckReviewers);
        const task: WorkflowStackTaskDto = _.cloneDeep(fixtStackTaskNotifyEmitter);

        workflowReaderService._updateStack(instance, task);

        expect(instance.stackTasks.find((s) => s.uuid === task.uuid)).toEqual(
            Object.assign(task, { active: true })
        );
        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskCheckNotifyReviewer.uuid).active).toBeFalsy();
    });

    it('updateStack - check loop', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeLoop);
        workflowReaderService._updateStack(instance, _.cloneDeep(fixtStackTaskNewDocumentOp));

        const stackTasksReduce = workflowUtilsService.stackTasksReduce(instance);
        expect(instance.stackTasks.length).toBe(9);
        expect(stackTasksReduce.length).toBe(2);
        expect(stackTasksReduce[0].taskModel).toBe('6b443bbe-1b2d-11e9-ab14-d663bd873d93');
        expect(stackTasksReduce[0].active).toBeFalsy();
        expect(stackTasksReduce[1].taskModel).toBe('e7d81563-6adb-a84a-4d1a-31295dd55205');
        expect(stackTasksReduce[1].active).toBeTruthy();
        expect(stackTasksReduce[1]).toBe(instance.stackTasks[instance.stackTasks.length - 1]);
    });

    it('updateData - after todo', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);

        workflowReaderService._updateData(instance, 'running');

        expect(instance.state).toBe('running');
        expect(instance.startDate).not.toBeNull();
    });

    it('updateData - after finished', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);

        workflowReaderService._updateData(instance, 'finished');

        expect(instance.state).toBe('finished');
        expect(instance.finishDate).not.toBeNull();
    });

    it('activeTask', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceCheckReviewers);
        const taskActive: WorkflowStackTaskDto = instance.stackTasks.find((s) => s.uuid === fixtStackTaskForm.uuid);

        workflowReaderService._activeTask(instance, taskActive);

        for (const stackTask of instance.stackTasks) {
            if (stackTask.uuid === taskActive.uuid) {
                expect(stackTask.active).toBeTruthy();
            } else {
                expect(stackTask.active).toBeFalsy();
            }
        }
    });

    it('updateSmartObjects - check add data', async () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);

        instance.smartobjects = [
            fixtSOEquipment_01
        ];
        instance.data = [
            {
                key: 'equipment',
                value: fixtSOEquipment_01.uuid,
                type: 'so:equipment'
            }
        ];

        workflowReaderService._updateSmartObjects(instance, fixtOperationsNewDocument);
        expect(instance.data.find((d) => d.key === 'document').value).toBe(fixtSODocument_NEW.uuid);
        expect(instance.data.find((d) => d.key === 'document').type).toBe('so:document');
        expect(JSON.parse(JSON.stringify(instance.smartobjects.find((so) => so.uuid === fixtSODocument_NEW.uuid))))
            .toEqual(fixtSODocument_NEW);
    });

    it('updateSmartObjects - check patch', async () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeNewDocument);

        workflowReaderService._updateSmartObjects(instance, fixtOperationsNewDocument);
        const smartobject = instance.smartobjects.find((so) => so.uuid === fixtSOEquipment_01.uuid);
        expect(smartobject.properties.find((p) => p.key === 'DOCUMENTS').value as any[]).toEqual(
            jasmine.arrayContaining(
                [fixtSODocument_NEW.uuid]
            )
        );
    });

    it('createOperations - check instance', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceUpload);
        instance.smartobjects = [
            _.cloneDeep(fixtSODocument_02)
        ];
        instance.data = [];

        workflowReaderService._createOperations(instance, fixtValidateUpload).subscribe(() => {
                // check operations
                expect(fixtOperationsUpload).toEqual(
                    workflowUtilsService.getActiveTask(instance).operations
                );

                // check reverse
                expect(fixReverseOperationUpload).toEqual(
                    workflowUtilsService.getActiveTask(instance).reverse
                );
                done();
            }
        );
    });

    it('createOperations - check placeToSave (array)', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceNewDocument);
        instance.smartobjects = [
            fixtSOEquipment_01
        ];
        instance.data = [
            {
                key: 'equipment',
                value: fixtSOEquipment_01.uuid,
                type: 'so:equipment'
            }
        ];

        workflowReaderService._createOperations(instance, fixtValidateNewDocument).subscribe(() => {

                // check operations
                expect(fixtOperationsNewDocument).toEqual(
                    workflowUtilsService.getActiveTask(instance).operations
                );

                // check reverse
                expect(fixtReverseNewDocument).toEqual(
                    workflowUtilsService.getActiveTask(instance).reverse
                );
                done();
            }
        );
    });

    it('createOperations - patch', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeNotifyReviewer);

        workflowReaderService._createOperations(instance, fixtValidateJumpWrite).subscribe(() => {
                // check operations
                expect(fixtOperationsNotifyEmitter).toEqual(
                    workflowUtilsService.getActiveTask(instance).operations
                );

                // check reverse
                expect(fixtReverseNotifyEmitter).toEqual(
                    workflowUtilsService.getActiveTask(instance).reverse
                );
                done();
            }
        );
    });

    it('createOperations - check API', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceUpload);
        instance.smartobjects = [
            _.cloneDeep(fixtSODocument_02)
        ];
        instance.data = [];

        workflowReaderService._createOperations(instance, fixtValidateUpload).subscribe(() => {

                // check operations
                const operations = _.reduce(instance.stackTasks, (results, task: WorkflowStackTaskDto) => {
                    results.push(...task.operations.filter((op) => op.saveOnApi));
                    return results;
                }, []);
                expect(operations).toEqual(
                    jasmine.arrayContaining(
                        fixtOperationsUpload.filter((o) => o.saveOnApi)
                    )
                );
                done();
            }
        );
    });

    it('moveForward - todo', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceTodo);

        workflowReaderService.moveForward(instance);
        expect(instance.stackTasks.length).toBe(1);
    });

    it('moveForward - finished (with finisher)', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);

        workflowReaderService.moveForward(instance, 'notify');
        expect(instance.state).toBe('running');
    });

    it('moveForward - finished (without finisher)', () => {
        // prepare data
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);
        const step = instance.workflowModel.steps.find((s) => s.key === 'review');
        const finisher = step.tasks.find((t) => t.type === 'TaskFinisher');
        const beforeFinisher = step.tasks.find((t) => t.properties.transitions[0].task === finisher.uuid);

        beforeFinisher.properties.transitions[0].task = null;
        _.remove(step.tasks, (t: TaskModelDto) => t.type === 'TaskFinisher');

        // test
        workflowReaderService.moveForward(instance, 'notify');
        expect(instance.state).toBe('finished');
    });

    it('moveForward - after jump', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeNotifyReviewer);

        workflowReaderService.moveForward(instance, 'notify');
        expect(instance.stackTasks.find((s) => s.taskModel === fixtStackTaskCheckNotifyReviewer.taskModel).active).toBeTruthy();
    });

    it('execute - error participants', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceCheckReviewers);

        workflowReaderService.execute(instance).subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof WorkflowErrorUnauthorizedProfil).toBeTruthy();
                done();
            });
    });

    it('execute - check return', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeUpload);
        const resCompare = _.cloneDeep(fixtInterpretorTaskUpload);
        delete resCompare.custom;
        resCompare.instance = instance;

        workflowReaderService.execute(instance).subscribe(
            (res) => {
                expect(res).toEqual(jasmine.objectContaining(resCompare));
                done();
            }
        );
    });

    it('execute - finished', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);
        instance.state = 'finished';

        workflowReaderService.execute(instance).subscribe(
            (res) => {
                expect(res).toBeNull();
                done();
            }
        );
    });

    it('finish (save)', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);

        workflowReaderService.finish(instance, true);
        expect(instance.state).toBe('finished');
    });

    it('finish (cancel)', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);

        workflowReaderService.finish(instance, false);
        expect(instance.state).toBe('canceled');
    });

    it('validate - history and stacks', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceReverseApiTagAfter);
        workflowReaderService.validate(instance, fixtValidateUpload02).subscribe(() => {
            expect(instance.stackTasks.length).toBe(4);
            done();
        });
    });

    it('validate - reverse', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceReverseApiTagAfter);
        workflowReaderService.validate(instance, fixtValidateUpload02).subscribe(() => {
            expect(instance.data.find((d) => d.key === 'notify')).toBeUndefined();
            done();
        });
    });

    it('validate - after jump no reverse - compare assets', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeUpload);
        const instanceCopy: WorkflowInstanceDto = _.cloneDeep(instance);
        workflowReaderService.validate(instance, fixtValidateUpload).subscribe(() => {
            done();
        });
    });

    it('validate - after jump no reverse - compare data & so', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeNewDocument);
        const instanceCopy: WorkflowInstanceDto = _.cloneDeep(instance);
        workflowReaderService.validate(instance, fixtValidateNewDocument).subscribe(() => {
            expect(instance.data).toEqual(instanceCopy.data);
            expect(instance.smartobjects).toEqual(instanceCopy.smartobjects);

            done();
        });
    });

    it('validate - saveOnAPi (false + false)', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceNewDocument);
        instance.smartobjects = [];
        instance.data = [];

        workflowReaderService.validate(instance, fixtValidateObject(false, Object.assign(_.cloneDeep(fixtSODocument_01), { local: true }))).pipe(
            mergeMap(() => workflowReaderService.validate(instance, fixtValidateObject(false,
                Object.assign(_.cloneDeep(fixtSODocument_01_update, { local: true })))))
        ).subscribe(() => {
            expect((instance.stackTasks[1].operations[0].value as CrudDto).op).toEqual('add');
            expect((instance.stackTasks[2].operations[0].value as CrudDto).op).toEqual('patch');

            done();
        });
    });

    it('validate - saveOnAPi (true + true)', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceNewDocument);
        instance.smartobjects = [];
        instance.data = [];

        workflowReaderService.validate(instance, fixtValidateObject(true, _.cloneDeep(fixtSODocument_01))).pipe(
            mergeMap(() => workflowReaderService.validate(instance, fixtValidateObject(true, _.cloneDeep(fixtSODocument_01_update))))
        ).subscribe(() => {
            expect((instance.stackTasks[1].operations[0].value as CrudDto).op).toEqual('add');
            expect((instance.stackTasks[2].operations[0].value as CrudDto).op).toEqual('patch');
            expect(JSON.parse(JSON.stringify(instance.smartobjects)))
                .toEqual([Object.assign(_.cloneDeep(fixtSODocument_01_update))]);

            done();
        });
    });

    it('validate - saveOnAPi (false + true)', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceNewDocument);
        instance.smartobjects = [];
        instance.data = [];

        workflowReaderService.validate(instance, fixtValidateObject(false, Object.assign(_.cloneDeep(fixtSODocument_01), { local: true }))).pipe(
            mergeMap(() => workflowReaderService.validate(instance, fixtValidateObject(true, _.cloneDeep(fixtSODocument_01_update))))
        ).subscribe(() => {
            expect((instance.stackTasks[1].operations[0].value as CrudDto).op).toEqual('add');
            expect((instance.stackTasks[2].operations[0].value as CrudDto).op).toEqual('add');
            expect(JSON.parse(JSON.stringify(instance.smartobjects)))
                .toEqual([Object.assign(_.cloneDeep(fixtSODocument_01_update))]);

            done();
        });
    });

    it('validate - saveOnAPi (true + false)', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceNewDocument);
        instance.smartobjects = [];
        instance.data = [];

        workflowReaderService.validate(instance, fixtValidateObject(true, _.cloneDeep(fixtSODocument_01))).pipe(
            mergeMap(() => workflowReaderService.validate(instance, fixtValidateObject(false, _.cloneDeep(fixtSODocument_01_update))))
        ).subscribe(() => {
            expect((instance.stackTasks[1].operations[0].value as CrudDto).op).toEqual('add');
            expect((instance.stackTasks[2].operations[0].value as CrudDto).op).toEqual('patch');
            expect(JSON.parse(JSON.stringify(instance.smartobjects)))
                .toEqual([Object.assign(_.cloneDeep(fixtSODocument_01_update))]);

            done();
        });
    });

    it('jump - not find', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);
        expect(() => { workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Jump, uuid: 'not find' }); })
            .toThrowError(WorkflowErrorJumped);
    });

    it('jump - not access', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);
        expect(() => {
            workflowReaderService.jump(instance,
                { direction: InterpretorTypeJump.Jump, uuid: fixtStackTaskNotifyReviewerOp.uuid });
        })
            .toThrowError(WorkflowErrorJumped);
    });

    it('jump - success', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceBeforeFinish);
        workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Jump, uuid: fixtStackTaskCheckNotifyReviewer.uuid });

        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskCheckNotifyReviewer.uuid).active).toBeTruthy();
        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskNotifyAll01.uuid).active).toBeFalsy();
    });

    it('jump - success by previous (01)', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceUpload);
        workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Previous });

        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskSelect.uuid).active).toBeTruthy();
    });

    it('jump - success by previous (02)', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceForm);

        workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Previous });
        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskUpload.uuid).active).toBeTruthy();
    });

    it('jump - failed by previous', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceSelect);

        expect(() => { workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Previous }); })
            .toThrowError(WorkflowErrorJumped);
    });

    it('jump - success by next', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceReverseApiTagBefore);

        workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Next });
        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskNotifyReviewerOp.uuid).active).toBeTruthy();
    });

    it('jump - success by next (2 task after)', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceSelectAfterJump);

        workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Next });
        expect(instance.stackTasks.find((s) => s.uuid === fixtStackTaskUpload.uuid).active).toBeTruthy();
    });

    it('jump - failed by next no access', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceJumpedBeforeNotifyReviewer);

        expect(() => { workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Next }); })
            .toThrowError(WorkflowErrorJumped);
    });

    it('jump - failed by next no task', () => {
        const instance: WorkflowInstanceDto = utils.setContext(fixtWorkflowInstanceSelect);

        expect(() => { workflowReaderService.jump(instance, { direction: InterpretorTypeJump.Next }); })
            .toThrowError(WorkflowErrorJumped);
    });
});
