import * as _ from 'lodash';
import { inject, TestBed } from '@angular/core/testing';
import { AppTestModule } from '../test-fixtures/mock/app.test.module';
import { ReportsUtilsService } from './reports-utils.service';
import { SoUtilsService } from './so-utils.service';
import { fixtSmartModels } from '../test-fixtures/smart-models';
import { PairDto, SmartObjectDto } from '@algotech-ce/core';
import { fixtImportSmartObjects } from '../test-fixtures/import.smart-object';
import moment from 'moment';

describe(ReportsUtilsService.name, () => {

    let soUtilsService: SoUtilsService;
    let csvFile: File;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    })

    beforeEach(inject([SoUtilsService, ReportsUtilsService],
        async (_soUtilsService: SoUtilsService, reportUtilsService: ReportsUtilsService) => {
            moment.locale('fr');
            soUtilsService = _soUtilsService;
            const csvText = 
`NUMBER,UNKNOWN,DATE,DATETIME,STRING,TIME,BOOL,SO,STRING_M
"55,44",test,30/05/80,1990-05-12,"1,c""',;:""a ;:!",15h35,true,test,test
55.44,test,01/05/80,1990-05-12,"2,c",16h25,false,test,test|test
22,test,aaa,1990-05-12,,dsdqs,1,test,`;
            csvFile = reportUtilsService.createTextFile('test.csv', csvText, 'csv', false);

        })
    );

    it(`${SoUtilsService.prototype.csvColumns.name} should return columns`, (done) => {
        // prepapre
        const smartModel = fixtSmartModels.find((m) => m.key === 'alltypes');
        const columns: PairDto[] = [{
            key: 'NUMBER',
            value: smartModel.properties.find((p) => p.key === 'NUMBER')
        }, {
            key: 'UNKNOWN',
            value: undefined,
        }, {
            key: 'DATE',
            value: smartModel.properties.find((p) => p.key === 'DATE')
        }, {
            key: 'TIME',
            value: smartModel.properties.find((p) => p.key === 'TIME')
        }, {
            key: 'BOOL',
            value: smartModel.properties.find((p) => p.key === 'BOOL'),
        }, {
            key: 'DATETIME',
            value: smartModel.properties.find((p) => p.key === 'DATETIME')
        }, {
            key: 'STRING',
            value: smartModel.properties.find((p) => p.key === 'STRING')
        }, {
            key: 'SO',
            value: undefined,
        }, {
            key: 'STRING_M',
            value: smartModel.properties.find((p) => p.key === 'STRING_M')
        }]

        // test
        soUtilsService.csvColumns(csvFile, smartModel)
        .subscribe((res: PairDto[]) => {
            expect(res).toEqual(jasmine.arrayContaining(columns));
            done();
        });
    });

    it(`${SoUtilsService.prototype.csvToSo.name} should return smartobjects`, (done) => {
        // prepapre
        const smartModel = fixtSmartModels.find((m) => m.key === 'alltypes');

        // test
        soUtilsService.csvToSo(csvFile, smartModel, {
            propertiesFormat: [{
                key: 'DATE',
                value: 'DD/MM/YYYY'
            }, {
                key: 'TIME',
                value: 'hh[h]mm'
            }]
        }).subscribe((res: SmartObjectDto[]) => {
            // rm uuid
            res = res.map((so) => {
                delete so.uuid;
                return so;
            });
            expect(res).toEqual(fixtImportSmartObjects);
            done();
        });
    });
});
