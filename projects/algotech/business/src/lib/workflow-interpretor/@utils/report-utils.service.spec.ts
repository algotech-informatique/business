import * as _ from 'lodash';
import { inject, TestBed } from '@angular/core/testing';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';
import { ReportsUtilsService } from './reports-utils.service';

describe(ReportsUtilsService.name, () => {

    let reportUtilsService: ReportsUtilsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    })

    beforeEach(inject([ReportsUtilsService],
        async (_reportUtilsService: ReportsUtilsService) => {
            reportUtilsService = _reportUtilsService;
        })
    );

    it(`${ReportsUtilsService.prototype.createTextFile.name} should return txt file`, () => {
        // prepapre
        const file = reportUtilsService.createTextFile('test.txt', 'Hello World!', 'txt', false);

        // test
        expect(file instanceof File).toBeTrue();
        expect(file.type).toBe('text/plain');
    });

    it(`${ReportsUtilsService.prototype.createTextFile.name} should return json file`, () => {
        // prepapre
        const file = reportUtilsService.createTextFile('test.json', '{"TEST": "TEST"}', 'json', false);

        // test
        expect(file instanceof File).toBeTrue();
        expect(file.type).toBe('application/json');
    });
});
