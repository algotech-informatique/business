import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { WorkflowTaskService } from './workflow-task.service';
import { fixtDataWorkflow } from '../../test-fixtures/data';
import {
    fixtSmartObjects,
    fixtSOEquipment_01,
    fixtSODocument_01,
    fixtSODocument_02,
    fixtSOEquipmentFromAPI,
    fixtSODocument_NEW,
} from '../../test-fixtures/smart-objects';
import { fixtWorkflowModel1 } from '../../test-fixtures/workflow-models';
import {
    SmartObjectDto, SmartModelDto, WorkflowInstanceDto, PairDto,
    WorkflowExpressionDto
} from '@algotech-ce/core';
import { fixtSmartModels } from '../../test-fixtures/smart-models';
import {
    WorkflowErrorSmartModelNotFind, WorkflowErrorPropertyNotFind,
    WorkflowErrorDataNotFind, WorkflowErrorSysModelNotFind, WorkflowErrorExpression
} from '../../../../../interpretor/src/error/interpretor-error';
import * as _ from 'lodash';
import { SettingsDataService } from '@algotech-ce/angular';
import { HttpTestingController } from '@angular/common/http/testing';
import { TestUtils } from '../../test-fixtures/mock/test-api-mock.utils';
import { fixtStackTaskNewDocument, fixtStackTaskNotifyReviewerOp } from '../../test-fixtures/stack-tasks';
import { fixtWorkflowInstanceTodo, fixtSettings } from '../../test-fixtures/workflow-instances';
import { fixtParticipantsTechnician1 } from '../../test-fixtures/profils';
import { classToPlain } from 'class-transformer';
import { fixtGlists } from '../../test-fixtures/genericlists';
import { AuthMockService } from '../../test-fixtures/mock/auth.mock.service';
import { environment } from '../../../../../../../../src/environments/environment';
import { AppTestModule } from '../../test-fixtures/mock/app.test.module';
import { InterpretorSoUtils } from '../../../../../interpretor/src';
import moment from 'moment';

describe('WorkflowTaskService', () => {
    let workflowTaskService: WorkflowTaskService;

    const task = fixtWorkflowModel1.steps[0].tasks[0];
    let utils: TestUtils;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([AuthMockService, SettingsDataService, WorkflowTaskService],
        async (
            authService: AuthMockService,
            settingsDataService: SettingsDataService,
            _workflowTaskService: WorkflowTaskService) => {

            workflowTaskService = _workflowTaskService;

            utils = new TestUtils(authService, getTestBed().get(HttpTestingController));
            utils.signin('jbernard', '123456');

            settingsDataService.smartmodels = fixtSmartModels;
            settingsDataService.glists = fixtGlists;
        }));

    it(`${WorkflowTaskService.prototype.browsePath.name} should return item of array`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService.browsePath(instance, 'equipment.DOCUMENTS.1.NAME').subscribe(
                (res: string) => {
                    expect(res).toBe('Document_02');
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.browsePath.name} should return item of array (root level)`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService.browsePath(instance, 'documents.0.NAME').subscribe(
                (res: string) => {
                    expect(res).toBe('Document_01');
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.browsePath.name} should return item of array (two levels)`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService.browsePath(instance, 'equipment.DOCUMENTS.1.USERS.1.EMAIL').subscribe(
                (res: string) => {
                    expect(res).toBe('j.ford@mail.fr');
                    done();
                }
            );
    });


    it(`${WorkflowTaskService.prototype.browsePath.name} should return item of array of string`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService.browsePath(instance, 'equipment.DOCUMENTS.1.VERSION.0}}').subscribe(
                (res: string) => {
                    expect(res).toBe('Version_01');
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.browsePath.name} should return null when index out of bounds.`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService.browsePath(instance, 'equipment.DOCUMENTS.2.NAME}}').subscribe(
                (res: string) => {
                    expect(res).toBeNull();
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype._clone.name} should return clone of object`, () => {
        // prepare data
        const object = { user: 'John' };

        // test
        expect(workflowTaskService._clone(object, {})).not.toBe(object);
        expect(workflowTaskService._clone(object, {})).toEqual(object);
    });

    it(`${WorkflowTaskService.prototype._clone.name} should return clone of SmartObject`, () => {
        // prepare data
        const smartObjects = InterpretorSoUtils.smartObjectToClass(fixtSmartObjects, true);

        // test
        expect(workflowTaskService._clone(smartObjects, {})).not.toBe(smartObjects);
        expect(workflowTaskService._clone(smartObjects, {})).toEqual(smartObjects);
    });

    it(`${WorkflowTaskService.prototype._clone.name} should return instance of object when clone is disabled`, () => {
        // prepare data
        const object = { user: 'John' };
        const smartObjects = InterpretorSoUtils.smartObjectToClass(fixtSmartObjects, true);

        // test
        expect(workflowTaskService._clone(object, { ignoreClone: true })).toBe(object);
        expect(workflowTaskService._clone(smartObjects, { ignoreClone: true })).toBe(smartObjects);
    });

    it(`${WorkflowTaskService.prototype._calculateValue.name} should return flatten array`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'flatten', { test: [['a', 'b'], ['c', 'd']] }, task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: any) => {
                    expect(res).toEqual({ test: ['a', 'b', 'c', 'd'] });
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype._calculateValue.name} should return flatten array (with formula)`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'flatten', { test: ['{{documents}}', '{{documents}}'] }, task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: any) => {
                    expect(JSON.parse(JSON.stringify(res))).toEqual({
                        test: [
                            fixtSODocument_01,
                            fixtSODocument_02,
                            fixtSODocument_01,
                            fixtSODocument_02
                        ]
                    });
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype._calculateValue.name} should return flatten array (with formula + value)`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'flattenformulavalue', { test: ['{{document}}', 'a'] }, task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: any) => {
                    expect(JSON.parse(JSON.stringify(res))).toEqual({
                        test: [
                            fixtSODocument_NEW,
                            'a'
                        ]
                    });
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype._calculateValue.name} should return empty array`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'empty', { test: [] }, task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: any) => {
                    expect(res).toEqual({ test: [] });
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype._calculateValue.name} should return empty array (with formula)`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'empty', { test: ['{{empty}}'] }, task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: any) => {
                    expect(res).toEqual({ test: [] });
                    done();
                }
            );
    });

    it('calculateValue - parameter', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'user', '{{client id}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: string) => {
                    expect(res).toBe('external');
                    done();
                }
            );
    });

    it('calculateValue - property', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'user', '{{document.USER.firstname}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: string) => {
                    expect(res).toBe('John');
                    done();
                }
            );
    });

    it('calculateValue - so', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'eqp', '{{equipment}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: SmartObjectDto) => {
                    expect(classToPlain(res)).toEqual(fixtSOEquipment_01);
                    done();
                }
            );
    });

    it('calculateValue - glists', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'glists', '{{document.USER.CATEGORY}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: string) => {
                    expect(res).toEqual('Viewer');
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.calculateValue.name} should return glist key`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'glists', '{{document.USER.CATEGORY}}', task.properties.services,
            task.properties.expressions, { formatted: true, searchParameters: { search: 'aaa'} }).subscribe(
                (res: string) => {
                    expect(res).toEqual('viewer');
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.calculateValue.name} should return glist value`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'glists', '{{document.USER.CATEGORY}}', task.properties.services,
            task.properties.expressions, { formatted: true, byValue: true }).subscribe(
                (res: string) => {
                    expect(res).toEqual('Viewer');
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.calculateValue.name} should return ISO date`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'glists', '{{document.DATE}}', task.properties.services,
            task.properties.expressions, { formatted: true }).subscribe(
                (res: string) => {
                    expect(moment(res, moment.ISO_8601).isValid()).toBeTrue();
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.calculateValue.name} should return date for display`, (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'glists', '{{document.DATE}}', task.properties.services,
            task.properties.expressions, { }).subscribe(
                (res: string) => {
                    expect(moment(res, moment.ISO_8601).isValid()).toBeFalse();
                    done();
                }
            );
    });

    it('calculateValue - array - so', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'documents', '{{equipment.DOCUMENTS}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: SmartObjectDto[]) => {
                    expect(classToPlain(res)).toEqual([fixtSODocument_01, fixtSODocument_02]);
                    done();
                }
            );
    });

    it('calculateValue - array', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'columns', ['COLUMN1', 'COLUMN2'], task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: string[]) => {
                    expect(res).toEqual(['COLUMN1', 'COLUMN2']);
                    done();
                }
            );
    });

    it('calculateValue - object', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const object = {
            user: '{{document.USER.firstname}}',
            object: {
                documents: '{{equipment.DOCUMENTS}}',
                machine: {
                    name: 'FMG'
                }
            }
        };

        const expected = {
            user: 'John',
            object: {
                documents: [fixtSODocument_01, fixtSODocument_02],
                machine: {
                    name: 'FMG'
                }
            }
        };

        workflowTaskService._calculateValue(instance, 'object', object, task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: SmartObjectDto[]) => {
                    expect(classToPlain(res)).toEqual(expected);
                    done();
                }
            );
    });

    it(`${WorkflowTaskService.prototype.calculateValue.name} should return original object`, (done) => {
        // prepare data
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const object = {
            user: '{{document.USER.firstname}}',
        };

        // test
        workflowTaskService._calculateValue(instance, 'object', object, task.properties.services,
        task.properties.expressions, { notInspectObject: true }).subscribe(
            (res: SmartObjectDto[]) => {
                expect(classToPlain(res)).toEqual(object);
                done();
            }
        );
    });

    it('calculateValue - array formula', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'array', ['{{equipment}}', '{{document}}', '{{document.USER.firstname}}'],
            task.properties.services, task.properties.expressions, {}).subscribe(
                (res: any[]) => {
                    expect(classToPlain(res)).toEqual([fixtSOEquipment_01, fixtSODocument_NEW, 'John']);
                    done();
                }
            );
    });

    it('calculateValue - array pairDTO', (done) => {
        const pairDTO: PairDto[] = [
            {
                key: 'eqp',
                value: '{{equipment}}',
            }, {
                key: 'doc',
                value: '{{document}}',
            }, {
                key: 'firstname',
                value: '{{document.USER.firstname}}'
            }, {
                key: 'lastname',
                value: 'Denver'
            }
        ];

        const result: PairDto[] = [
            {
                key: 'eqp',
                value: fixtSOEquipment_01,
            }, {
                key: 'doc',
                value: fixtSODocument_NEW,
            }, {
                key: 'firstname',
                value: 'John'
            }, {
                key: 'lastname',
                value: 'Denver'
            }
        ];

        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'array', pairDTO, task.properties.services, task.properties.expressions, {}).subscribe(
            (res: any[]) => {
                expect(classToPlain(res)).toEqual(result);
                done();
            }
        );
    });

    it(`${WorkflowTaskService.prototype.calculateValue.name} should return original array`, (done) => {
        // prepare data
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const array = [{
            user: '{{document.USER.firstname}}',
        }];

        // test
        workflowTaskService._calculateValue(instance, 'array', array, task.properties.services,
        task.properties.expressions, { notInspectObject: true }).subscribe(
            (res: SmartObjectDto[]) => {
                expect(classToPlain(res)).toEqual(array);
                done();
            }
        );
    });

    it('calculateValue - value', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'result', 'value', task.properties.services, task.properties.expressions, {}).subscribe(
            (res: string) => {
                expect(res).toBe('value');
                done();
            }
        );
    });

    it('calculateValue - formula', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'user', 'User: {{document.USER.firstname}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res: string) => {
                    expect(res).toBe('User: John');
                    done();
                }
            );
    });

    it('calculateValue - value(number)', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'length', 55, task.properties.services, task.properties.expressions, {}).subscribe(
            (res: number) => {
                expect(res).toBe(55);
                done();
            }
        );
    });

    it('calculateValue - error - property not found', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'result', '{{equipment.NOTFOUND}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                () => {
                    Promise.reject(new Error());
                    done();
                },
                (err) => {
                    expect(err instanceof WorkflowErrorPropertyNotFind).toBeTruthy();
                    done();
                });
    });

    it('calculateValue - error - data not found', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'eqp', '{{equipmenttttt}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                () => {
                    Promise.reject(new Error());
                    done();
                },
                (err) => {
                    expect(err instanceof WorkflowErrorDataNotFind).toBeTruthy();
                    done();
                });
    });

    it('calculateValue - error - smart model not found', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'user', '{{document.USER}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                () => {
                    Promise.reject(new Error());
                    done();
                },
                (err) => {
                    expect(err instanceof WorkflowErrorSmartModelNotFind).toBeTruthy();
                    done();
                });
    });

    it('calculateValue - download smart object', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: _.cloneDeep(fixtSmartObjects.filter((so) => so.modelKey !== 'USER')), data: fixtDataWorkflow }));

        workflowTaskService._calculateValue(instance, 'user', '{{document.USER.EMAIL}}', task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res) => {
                    expect(res).toBe('j.ford@mail.fr');
                    done();
                });

        utils.getUser();
        utils.verify();
    });

    it('isFormula', () => {
        expect(workflowTaskService._isFormula('User: {{document.USER.firstname}}')).toBeTruthy();
        expect(workflowTaskService._isFormula('{{document.USER.fristname}}')).toBeFalsy();
        expect(workflowTaskService._isFormula('{{document.USER.firstname}}{{document.USER.lastname}}')).toBeTruthy();
        expect(workflowTaskService._isFormula('John')).toBeFalsy();
    });

    it('calculateFormula', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateFormula('User : {{document.USER.firstname}} {{document.USER.lastname}} {{client id}}',
            false, ((v: any) => workflowTaskService._calculateValue(instance, 'user',
                v, task.properties.services, task.properties.expressions, {}))).subscribe(
                    (res) => {
                        expect(res).toBe('User : John Ford external');
                        done();
                    }
                );
    });

    it('calculateFormula - error - property not found', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._calculateFormula('equipment : {{equipment.NOTFOUND}}',
            false, ((v: any) => workflowTaskService._calculateValue(instance, 'eqp',
                v, task.properties.services, task.properties.expressions, {}))).subscribe(
                    () => {
                        Promise.reject(new Error());
                        done();
                    },
                    (err) => {
                        expect(err instanceof WorkflowErrorPropertyNotFind).toBeTruthy();
                        done();
                    });
    });

    it('calculateData - primitive data', (done) => {
        workflowTaskService._calculateData(55, 'number', fixtSmartObjects, 'en-US').subscribe(
            (res) => {
                expect(res).toBe(55);
                done();
            }
        );
    });

    it('calculateData - so', (done) => {
        workflowTaskService._calculateData(fixtSODocument_01.uuid,
            'so:document', fixtSmartObjects, 'en-US').subscribe(
                (res) => {
                    expect(classToPlain(res)).toEqual(fixtSODocument_01);
                    done();
                }
            );;
    });

    it('skipAndLimit - skip & limit', () => {
        expect(workflowTaskService.skipAndLimit({ searchParameters: { skip: 1, limit: 2 }}, ['a', 'b', 'c', 'd']))
            .toEqual(['c', 'd']);
    });

    it('skipAndLimit - skip & limit equal', () => {
        expect(workflowTaskService.skipAndLimit({ searchParameters: { skip: 1, limit: 1 }}, ['a', 'b', 'c', 'd']))
            .toEqual(['b']);
    });

    it('skipAndLimit - skip > limit', () => {
        expect(workflowTaskService.skipAndLimit({ searchParameters: { skip: 2, limit: 1}}, ['a', 'b', 'c', 'd']))
            .toEqual(['c']);
    });

    it('skipAndLimit - skip over', () => {
        expect(workflowTaskService.skipAndLimit({ searchParameters: { skip: 10000 }}, ['a', 'b', 'c', 'd']))
            .toEqual([]);
    });

    it('skipAndLimit - skip below', () => {
        expect(workflowTaskService.skipAndLimit({ searchParameters: { skip: -10000}}, ['a', 'b', 'c', 'd']))
            .toEqual(['a', 'b', 'c', 'd']);
    });

    it('skipAndLimit - limit over', () => {
        expect(workflowTaskService.skipAndLimit({searchParameters: { limit: 10000}}, ['a', 'b', 'c', 'd']))
            .toEqual(['a', 'b', 'c', 'd']);
    });

    it('skipAndLimit - search', () => {
        expect(workflowTaskService.skipAndLimit({searchParameters: {search: 'keyword1 keyword3'}}, ['keyword1 keyword2 keyword3 keyword4', 'keyword1 keyword5']))
            .toEqual(['keyword1 keyword2 keyword3 keyword4']);
    });

    it('browseSmartObject', (done) => {
        workflowTaskService._browseSmartObject(fixtSmartModels, fixtGlists,
            fixtSODocument_01, fixtSmartObjects, ['USER', 'firstname'], 'en-US').subscribe(
                (res) => {
                    expect(res).toBe('John');
                    done();
                }
            );
    });

    it('browseObject - return object', (done) => {
        workflowTaskService._browseObject({
            propA: {
                propB: {
                    propC: {
                        value: 55
                    }
                },
            }
        }, ['propA', 'propB', 'propC']).subscribe(
            (res) => {
                expect(res).toEqual({ value: 55 })
                done();
            }
        );
    });

    it('browseObject - return value', (done) => {
        workflowTaskService._browseObject({
            propA: {
                propB: {
                    propC: {
                        value: 55
                    }
                },
            }
        }, ['propA', 'propB', 'propC', 'value']).subscribe(
            (res) => {
                expect(res).toBe(55);
                done();
            }
        );
    });

    it('browseObject - return error', (done) => {
        workflowTaskService._browseObject({
            propA: {
                propB: {
                    propC: {
                        value: 55
                    }
                },
            }
        }, ['propA', 'propError', 'propC']).subscribe(() => {
            Promise.reject(new Error());
            done();
        }, (err) => {
            expect(err instanceof WorkflowErrorSysModelNotFind).toBeTruthy();
            done();
        });
    });

    it('isExpression - true', () => {
        expect(workflowTaskService._isExpression('CURRENT_YEAR', task.properties.expressions))
            .toBeTruthy();
    });

    it('isExpression - false', () => {
        expect(workflowTaskService._isExpression('equipment.DOCUMENTS', task.properties.expressions))
            .toBeFalsy();
    });

    it('executeExpression - check result', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const expressions: WorkflowExpressionDto[] = [{
            key: 'DOCUMENT_YEAR',
            value: 'YEAR({{document.DATE}})',
            type: 'number',
        }, {
            key: 'TEST',
            value: `CONCATENATE('$REF', ' ', RIGHT({{equipment.NAME}}, 2), ' ', {{DOCUMENT_YEAR}})`,
            type: 'string',
        }];
        workflowTaskService._executeExpression(instance, expressions[1], task.properties.services,
            expressions, 'en-US', {}).subscribe(
                (res) => {
                    expect(res).toEqual('$REF 01 2012');
                    done();
                }
            );
    });

    it('executeExpression - lang', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const expressions: WorkflowExpressionDto[] = [{
            key: 'LANG',
            value: [{
                lang: 'fr-FR',
                value: 'Test d\'un texte traduit avec valeur : {{document.USER.firstname}}',
            }],
            type: 'string',
        }];
        workflowTaskService._executeExpression(instance, expressions[0], task.properties.services,
            expressions, 'fr-FR', {}).subscribe(
                (res) => {
                    expect(res).toEqual('Test d\'un texte traduit avec valeur : John');
                    done();
                }
            );
    });

    it('executeExpression - failed', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const expressions: WorkflowExpressionDto[] = [{
            key: 'FAILED',
            value: 'YEAR(',
            type: 'number',
        }];
        workflowTaskService._executeExpression(instance, expressions[0], task.properties.services,
            expressions, 'en-US', {}).subscribe(
                () => {
                    Promise.reject(new Error());
                    done();
                },
                (err) => {
                    expect(err instanceof WorkflowErrorExpression).toBeTruthy();
                    done();
                });
    });

    it('executeExpression - check stringify', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const expression: WorkflowExpressionDto = {
            key: 'stringify',
            value: 'STRINGIFY({{object}})',
            type: 'string',
        };
        workflowTaskService._executeExpression(instance, expression, task.properties.services,
            [expression], 'en-US', {}).subscribe(
                (res) => {
                    expect(res).toEqual('{"test":"toto"}');
                    done();
                }
            );
    });

    it('executeExpression - check parse', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        const expression: WorkflowExpressionDto = {
            key: 'parse',
            value: 'PARSE("{”test”:”toto”}")',
            type: 'object',
        };
        workflowTaskService._executeExpression(instance, expression, task.properties.services,
            [expression], 'en-US', {}).subscribe(
                (res) => {
                    expect(res).toEqual({ test: 'toto' });
                    done();
                }
            );
    });

    it('isService - true', () => {
        expect(workflowTaskService._isService('get-smart-objects-by-model', task.properties.services))
            .toBeTruthy();
    });

    it('isService - false', () => {
        expect(workflowTaskService._isService('equipment.DOCUMENTS', task.properties.services))
            .toBeFalsy();
    });

    it('executeService - GET check result', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._executeService(instance, task.properties.services[0], task.properties.services,
            task.properties.expressions, {}).subscribe(
                (res) => {
                    expect(classToPlain(res)).toEqual(
                        jasmine.arrayContaining([
                            fixtSOEquipmentFromAPI
                        ])
                    );
                    done();
                }
            );

        utils.getEquipments();
        utils.verify();
    });

    it('executeService - with result check result', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));

        workflowTaskService._executeService(instance, task.properties.services[0], task.properties.services,
            task.properties.expressions, { }).subscribe(
                (res) => {
                    expect(res).toEqual(
                        jasmine.arrayContaining([])
                    );
                    done();
                }
            );

        const request = utils.httpMock.expectOne(`${environment.API_URL}/smart-objects/model/EQUIPMENT`);
        request.flush([]);
        utils.verify();
    });

    it('calculateCustom - service', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));
        const custom = workflowTaskService.calculateCustom(instance, task);

        custom.items().subscribe(
            (res) => {
                expect(classToPlain(res)).toEqual(
                    jasmine.arrayContaining([
                        fixtSOEquipmentFromAPI
                    ])
                );
                done();
            });

        utils.getEquipments();
        utils.verify();
    });

    it('calculateCustom - data', async () => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: fixtSmartObjects, data: fixtDataWorkflow }));
        const custom = workflowTaskService.calculateCustom(instance, task);

        await custom.columnsDisplay().toPromise().then(
            (res) => {
                expect(res).toEqual(['NAME']
                );
            });
        await custom.multipleSelection().toPromise().then(
            (res) => {
                expect(res).toBeFalsy();
            }
        );
    });

    it('calculateCustom - smart model', (done) => {
        const instance: WorkflowInstanceDto = utils.setContext(_.assign(_.cloneDeep(fixtWorkflowInstanceTodo),
            { smartobjects: [], data: [] }));
        const taskNewDocument = fixtWorkflowModel1.steps[0].tasks.find((t) => t.uuid === fixtStackTaskNewDocument.taskModel);

        const custom = workflowTaskService.calculateCustom(instance, taskNewDocument);

        custom.smartModel().subscribe(
            (res: SmartModelDto) => {
                expect(res).toEqual(fixtSmartModels.find((sm) => sm.key.toUpperCase() === 'DOCUMENT'));
                done();
            });
    });

    it('calculateCustom - profiles', (done) => {
        const instance: WorkflowInstanceDto = _.cloneDeep(fixtWorkflowInstanceTodo);
        instance.settings = fixtSettings;
        instance.participants = fixtParticipantsTechnician1;
        instance.data = [];
        instance.smartobjects = [];
        instance.context = utils.getContext();

        const taskNotify = fixtWorkflowModel1.steps[0].tasks.find((t) => t.uuid === fixtStackTaskNotifyReviewerOp.taskModel);

        const custom = workflowTaskService.calculateCustom(instance, taskNotify);

        custom.profiles().subscribe(
            (res: string[]) => {
                expect(res).toEqual(['grp:admin']);
                done();
            });
    });
});
