import { TestBed, inject } from '@angular/core/testing';
import { appTestReload } from './test-fixtures/app-test-reload';
import * as _ from 'lodash';
import { ApplicationModelDto } from '@algotech/core';
import { PageUtilsService } from './page-utils.service';
import { AppTestModule } from '../../workflow-interpretor/test-fixtures/mock/app.test.module';

describe(PageUtilsService.name, () => {

    let pageUtilsService: PageUtilsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([PageUtilsService],
        async (
            _pageUtilsService: PageUtilsService,) => {
            pageUtilsService = _pageUtilsService;
        }));

    it(`${PageUtilsService.prototype.isMasterWidget.name} : should return true when widget is at the root of the page`, () => {
        // prepare data
        const app: ApplicationModelDto = _.cloneDeep(appTestReload);
        const page = app.snApp.pages[0];
        const liste = page.widgets.find((w) => w.typeKey === 'list');

        // test
        expect(pageUtilsService.isMasterWidget(page, liste)).toBeTrue();
        expect(pageUtilsService.isMasterWidget(page, liste.group.widgets[0])).toBeFalse();
    })

    it(`${PageUtilsService.prototype.getDataSourcesFromWidget.name} : should return the data sources corresponding to the widget`, () => {
        // prepare data
        const app: ApplicationModelDto = _.cloneDeep(appTestReload);
        const page = app.snApp.pages[0];
        const text = page.widgets.find((w) => w.typeKey === 'text');
        const button = page.widgets.find((w) => w.typeKey === 'button');
        const liste = page.widgets.find((w) => w.typeKey === 'list');
        const dataSourceRand = page.dataSources.find((ds) => ds.key === 'random');
        const dataSourceMachines = page.dataSources.find((ds) => ds.key === 'machines');

        // test
        expect(pageUtilsService.getDataSourcesFromWidget(page, text)).toEqual([
            dataSourceRand
        ]);
        expect(pageUtilsService.getDataSourcesFromWidget(page, liste)).toEqual([
            dataSourceMachines
        ]);
        expect(pageUtilsService.getDataSourcesFromWidget(page, button)).toEqual([
        ]);
    })
});

