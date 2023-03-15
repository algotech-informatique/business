import * as _ from 'lodash';
import { getTestBed, inject, TestBed } from '@angular/core/testing';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';
import { TaskUtilsService } from './task-utils.service';
import { fixtInterpretorService, fixtInterpretorTaskFormDocument, fixtInterpretorTaskUpload } from '../test-fixtures/interpretor-task';
import { TaskUploadOptions } from '../../../../interpretor/src/dto/interfaces/task-upload-options';
import { TestUtils } from '../test-fixtures/mock/test-api-mock.utils';
import { AuthService } from '@algotech/angular';
import { AuthMockService } from '../test-fixtures/mock/auth.mock.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { fixtWorkflowInstanceTodo } from '../test-fixtures/workflow-instances';
import { FileUploadDto, SysFile } from '@algotech/core';
import { ATHttpException, InterpretorTaskActionAssetDto, WorkflowTaskActionUploadDto } from '../../../../interpretor/src';
import { fixtSOEquipment_01 } from '../test-fixtures/smart-objects';
import { TaskServiceError } from '../../../../interpretor/src/error/tasks-error';

describe(TaskUtilsService.name, () => {

    let taskUtilsService: TaskUtilsService;
    let file: File;
    let options: TaskUploadOptions;
    let utils: TestUtils;
    let info: FileUploadDto;
    let sysFile: SysFile;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    })

    beforeEach(inject([AuthService, TaskUtilsService],
        async (authService: AuthMockService, _taskUtilsService: TaskUtilsService) => {
            taskUtilsService = _taskUtilsService;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');

            const instance = utils.setContext(fixtWorkflowInstanceTodo);

            file = new File(['TEST'], 'test.txt', { type: 'text/plain' });
            options = {
                ext: 'txt',
                fileName: 'test',
                object: null,
                save: true,
                task: _.assign(_.cloneDeep(fixtInterpretorTaskUpload), { instance }),
                version: null
            };

            info = taskUtilsService._createUploadInfo(options);
            sysFile = taskUtilsService._createSysFile(file, options, info);
        })
    );

    it(`${TaskUtilsService.prototype.getTransitionData.name} should return data`, () => {
        // prepapre
        const data = taskUtilsService.getTransitionData(fixtInterpretorTaskUpload);

        // test
        expect(data).toEqual({
            key: 'file',
            type: 'sys:file',
        })
    });

    it(`${TaskUtilsService.prototype.getTransitionData.name} should return null`, () => {
        // prepapre
        const data = taskUtilsService.getTransitionData(fixtInterpretorTaskFormDocument);

        // test
        expect(data).toBeNull();
    });

    it(`${TaskUtilsService.prototype.computevalidation.name} should return validation`, () => {
        // prepapre
        const validation = taskUtilsService.computevalidation([]);

        // test
        expect(validation).toEqual({ transitionKey: 'done', transfers: [] });
    });

    it(`${TaskUtilsService.prototype.getUploadTransfers.name} should return two transfers`, () => {
        // prepare
        const upload = taskUtilsService.getUploadTransfers(file, options);

        // test
        expect(upload.length).toEqual(2);
    });

    it(`${TaskUtilsService.prototype._createSysFile.name} should return sysfile`, () => {
        // prepare
        const sysFile = taskUtilsService._createSysFile(file, options, info);

        // test
        expect(sysFile.documentID).toBe(info.documentID);
        expect(sysFile.ext).toBe(options.ext);
    });

    it(`${TaskUtilsService.prototype._createUploadInfo.name} should return upload info with documentID corresponding to the version`, () => {
        // prepare
        const _options: TaskUploadOptions = _.cloneDeep(options);
        _options.version = sysFile;
        const info = taskUtilsService._createUploadInfo(_options);

        // test
        expect(info.documentID).toBe(sysFile.documentID);
    });

    it(`${TaskUtilsService.prototype._createUploadInfo.name} should return upload info with new documentID`, () => {
        // prepare
        const info = taskUtilsService._createUploadInfo(options);

        // test
        expect(info.documentID).not.toBe(sysFile.documentID);
    });

    it(`${TaskUtilsService.prototype._createActionUploadTransfer.name} should return action transfer`, () => {
        // prepare
        const upload = taskUtilsService._createActionUploadTransfer(file, sysFile, info, options);
        const action: InterpretorTaskActionAssetDto = upload.value as InterpretorTaskActionAssetDto;
        const actionValue: WorkflowTaskActionUploadDto = action.value;

        // test
        expect(action.asset.file).toBe(file);
        expect(action.asset.infoFile.documentID).toBe(info.documentID);
        expect(actionValue).toEqual({
            smartObject: null,
            fileName: options.fileName,
            fileType: file.type,
            file: info.versionID,
            info,
        })
    });

    it(`${TaskUtilsService.prototype._createActionUploadTransfer.name} should return action transfer with smartobject`, () => {
        // prepare
        const _options: TaskUploadOptions = _.cloneDeep(options);
        _options.object = fixtSOEquipment_01;
        const upload = taskUtilsService._createActionUploadTransfer(file, sysFile, info, _options);
        const actionValue: WorkflowTaskActionUploadDto = (upload.value as InterpretorTaskActionAssetDto).value;

        // test
        expect(actionValue.smartObject).toEqual(_options.object.uuid);
    });

    it(`${TaskUtilsService.prototype._createActionUploadTransfer.name} should return action transfer without smartobject when save disabled`, () => {
        // prepare
        const _options: TaskUploadOptions = _.cloneDeep(options);
        _options.object = fixtSOEquipment_01;
        _options.save = false;

        const upload = taskUtilsService._createActionUploadTransfer(file, sysFile, info, _options);
        const actionValue: WorkflowTaskActionUploadDto = (upload.value as InterpretorTaskActionAssetDto).value;

        // test
        expect(actionValue.smartObject).toBeNull();
    });

    it(`${TaskUtilsService.prototype._createDataUploadTransfer.name} should return null when no data`, () => {
        // prepare
        const _options: TaskUploadOptions = _.cloneDeep(options);
        _options.task.transitions = [];
        const data = taskUtilsService._createDataUploadTransfer(sysFile, _options);
        
        // test
        expect(data).toBeNull();
    });

    it(`${TaskUtilsService.prototype._createDataUploadTransfer.name} should return data transfer`, () => {
        // prepare
        const _options: TaskUploadOptions = _.cloneDeep(options);
        const data = taskUtilsService._createDataUploadTransfer(sysFile, _options);
        
        // test
        expect((data.value as SysFile).documentID).toBe(info.documentID);
        expect((data.value as SysFile).ext).toBe(_options.ext);
    });

    it(`${TaskUtilsService.prototype.handleHttpError.name} should return error`, (done) => {
        // prepare
        const error = new ATHttpException('', 500, {}, '');
        const handle = taskUtilsService.handleHttpError(error, fixtInterpretorTaskUpload, TaskServiceError);
        
        // test
        handle.subscribe(() => {
            Promise.reject(new Error());
            done();
        },
            (err) => {
                expect(err instanceof TaskServiceError).toBeTruthy();
                done();
            });
    });

    it(`${TaskUtilsService.prototype.handleHttpError.name} should return two transfers`, (done) => {
        // prepare
        const error = new ATHttpException('', 500, {}, '');
        const handle = taskUtilsService.handleHttpError(error, fixtInterpretorService, TaskServiceError);
        
        // test
        handle.subscribe((res) => {
            expect(res.transfers.length).toEqual(2);
            done();
        });
    });

    it(`${TaskUtilsService.prototype._getErrorData.name} should return null`, () => {
        // prepare
        const errorData = taskUtilsService._getErrorData(fixtInterpretorTaskUpload);
        
        // test
        expect(errorData).toBeNull();
    });

    it(`${TaskUtilsService.prototype._getErrorData.name} should return data`, () => {
        // prepare
        const errorData = taskUtilsService._getErrorData(fixtInterpretorService);
        
        // test
        expect(errorData).toEqual([{
            key: 'service_error__2',
            type: 'number'
        }, {
            key: 'service_error__3',
            type: 'string'
        }])
    });

    it(`${TaskUtilsService.prototype._getHttpErrorTransfers.name} should return transfers (error as object)`, () => {
        // prepare
        const error = new ATHttpException('error', 400, { error: true }, '');
        const validation = taskUtilsService._getHttpErrorTransfers(error, fixtInterpretorService);
        
        // test
        expect(validation.transfers).toEqual([{
            saveOnApi: false,
            data: {
                key: 'service_error__2',
                type: 'number'
            },
            type: 'sysobjects',
            value: 400
        }, {
            saveOnApi: false,
            data: {
                key: 'service_error__3',
                type: 'object'
            },
            type: 'sysobjects',
            value: { error: true }
        }])
    });

    it(`${TaskUtilsService.prototype._getHttpErrorTransfers.name} should return transfers (error as object stringify)`, () => {
        // prepare
        const error = new ATHttpException('error', 400, JSON.stringify({ error: true }), '');
        const validation = taskUtilsService._getHttpErrorTransfers(error, fixtInterpretorService);
        
        // test
        expect(validation.transfers).toEqual(jasmine.arrayContaining([{
            saveOnApi: false,
            data: {
                key: 'service_error__3',
                type: 'object'
            },
            type: 'sysobjects',
            value: { error: true }
        }]))
    });

    it(`${TaskUtilsService.prototype._getHttpErrorTransfers.name} should return transfers (error as string)`, () => {
        // prepare
        const error = new ATHttpException('error', 400, 'an error occured', '');
        const validation = taskUtilsService._getHttpErrorTransfers(error, fixtInterpretorService);
        
        // test
        expect(validation.transfers).toEqual(jasmine.arrayContaining([{
            saveOnApi: false,
            data: {
                key: 'service_error__3',
                type: 'string'
            },
            type: 'sysobjects',
            value: 'an error occured'
        }]))
    });
});
