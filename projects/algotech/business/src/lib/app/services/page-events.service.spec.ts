import { TestBed, inject } from '@angular/core/testing';
import { PageEventsService } from './page-events.service';
import { appTestReload } from './test-fixtures/app-test-reload';
import * as _ from 'lodash';
import { ApplicationModelDto } from '@algotech/core';
import { AppTestModule } from '../../workflow-interpretor/test-fixtures/mock/app.test.module';

describe(PageEventsService.name, () => {

    let pageEventsService: PageEventsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppTestModule],
        });
    });

    beforeEach(inject([PageEventsService],
        async (
            _pageEventsService: PageEventsService,) => {
            pageEventsService = _pageEventsService;
        }));

    
    beforeEach(() => {
        pageEventsService._data = [{
            key: 'datasource.random',
            value: 10,
            type: 'number',
        }, {
            key: 'datasource.machines',
            value: [],
            type: 'so:machine'
        }];
    })

    it(`${PageEventsService.prototype.unloadDataSources.name} : should set unloaded to true by intersect data with dataSources entry params`, () => {
        // prepare data
        const app: ApplicationModelDto = _.cloneDeep(appTestReload);
        const dataSource = app.snApp.pages[0].dataSources.find((ds) => ds.action === 'random');

        // test
        pageEventsService.unloadDataSources([dataSource]);
        expect(pageEventsService._data[0].unloaded).toBeTrue();
        expect(pageEventsService._data[1].unloaded).toBeUndefined();
    })

    it(`${PageEventsService.prototype.unloadDataSources.name} : should set unloaded to true for all data`, () => {
        // test
        pageEventsService.unloadDataSources();
        expect(pageEventsService._data[0].unloaded).toBeTrue();
        expect(pageEventsService._data[1].unloaded).toBeTrue();
    })

    it(`${PageEventsService.prototype._executeRefresh.name} : should set unloaded to true on the data corresponding to the datasources used by the reloaded widget`, (done) => {
        // prepare data
        const app: ApplicationModelDto = _.cloneDeep(appTestReload);
        const page = app.snApp.pages[0];
        const reload = page.widgets.find((w) => w.name === 'Bouton').events[0].pipe[0];

        // test
        pageEventsService._executeRefresh(app, page, reload).subscribe(() => {
            expect(pageEventsService._data[0].unloaded).toBeTrue();
            expect(pageEventsService._data[1].unloaded).toBeUndefined();
            done();
        });
    })

    it(`${PageEventsService.prototype._executeRefresh.name} : should do noting when the reloading widget is not find`, (done) => {
        // prepare data
        const app: ApplicationModelDto = _.cloneDeep(appTestReload);
        const page = app.snApp.pages[0];
        const reload = page.widgets.find((w) => w.name === 'Bouton').events[0].pipe[0];
        reload.action = 'zzz';

        // test
        pageEventsService._executeRefresh(app, page, reload).subscribe(() => {
            expect(pageEventsService._data[0].unloaded).toBeUndefined();
            expect(pageEventsService._data[1].unloaded).toBeUndefined();
            done();
        });
    })
});

