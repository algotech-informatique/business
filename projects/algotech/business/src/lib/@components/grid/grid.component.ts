import { DataService } from '@algotech-ce/angular';
import { SysQueryDto } from '@algotech-ce/core';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Input, OnChanges, Optional, Output, SimpleChanges, SkipSelf, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Popover } from '../popover/interfaces/popver.interface';
import { returnProvider } from '../popover/utility';
import { GridColumnFilterComponent } from './components/popup/column-filter/grid-column-filter.component';
import { GridColumnManageComponent } from './components/popup/column-manage/grid-column-manage.component';
import { GridColumnConfigurationDto } from './dto/grid-column-configuration.dto';
import { GridConfigurationDto } from './dto/grid-configuration.dto';
import { GridScrollDto } from './dto/grid-scroll.dto';
import { GridStorageDto } from './dto/grid-storage.dto';
import { GridD3Service } from './services/grid-d3.service';
import * as _ from 'lodash';

@Component({
    selector: 'at-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    providers: [
        returnProvider(GridComponent)
    ],
})

export class GridComponent implements AfterViewInit, OnChanges {
    @ViewChild(IonContent, { static: true }) content: IonContent;
    @ViewChild('grid') grid: ElementRef;

    @Input()
    configuration: GridConfigurationDto;

    @Input()
    saveConfiguration = false;

    @Input()
    saveQuery = false;

    @Input()
    showFilters = true;

    @Input()
    paginate: 'button' | 'infinite' | 'none' = 'none';

    @Input()
    newRowPlaceHolder: string;

    @Input()
    currentQuery: SysQueryDto;

    @Input()
    moreDataToLoad = true;

    @Input()
    loading = false;

    @Input()
    forceOverscroll = false;

    @Input()
    empty = false;

    @Output()
    select = new EventEmitter<boolean>();

    @Output()
    actionClick = new EventEmitter();

    @Output()
    configurationChanged = new EventEmitter<any>(); // 

    @Output()
    addNewRow = new EventEmitter();

    @Output()
    queryChanged = new EventEmitter<SysQueryDto>(); // return list of filter (filter, sort, ...)

    showPopup = new Subject<Popover>();
    dismissPopup = new Subject<any>();
    ready = new Subject();

    display = false;
    width = 0;

    constructor(private gridD3: GridD3Service, private ref: ChangeDetectorRef, private dataService: DataService) { }

    ngAfterViewInit() {
        this.ref.detectChanges();
        this.content.getScrollElement().then((sc) => {
            this.width = sc.clientWidth;
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.configuration?.currentValue) {
            this.display = false;
            this.restore().subscribe(() => {
                this.ref.detectChanges();
                this.gridD3.initDrag(this.configuration,
                    (ev) => this.scrollTo(ev),
                    (ev, key) => this.onColumnClick(ev, key),
                    () => this.changed());
                this.display = true;
                this.ready.next(null);
            })
        }
    }

    focus(id: string, key: string, scrollTo: 'top' | 'bottom' | 'none' = 'none') {
        let ele = document.querySelector(`.row[id*="${id}"] .cell-value[id*="${key}"] textarea`);
        if (!ele) {
            document.querySelector(`.row[id*="${id}"] .cell-value[id*="${key}"] input`);
        }
        if (ele) {
            (ele as HTMLTextAreaElement).focus({ preventScroll: scrollTo !== 'none' });
        }

        switch (scrollTo) {
            case 'bottom':
                this.content.scrollToBottom(300);
                break;
            case 'top':
                this.content.scrollToTop(300);
                break;
        }
    }

    scrollTo(event: GridScrollDto) {
        this.content.getScrollElement().then((sc) => {
            if (event.x < sc.scrollLeft) {
                this.content.scrollToPoint(event.x, null, event.delay);
            }
            if (event.x + event.offsetRight >= sc.scrollLeft + sc.clientWidth) {
                this.content.scrollToPoint(event.x + event.offsetRight - sc.clientWidth, null, event.delay);
            }
        })
    }

    loadMore() {
        this.currentQuery.skip++;
        this.save();
        this.queryChanged.emit(this.currentQuery);
    }

    filter(value: string) {
        this.currentQuery.skip = 0;
        this.currentQuery.search = value;
        this.queryChanged.emit(this.currentQuery);
    }

    changed() {
        this.save();
        this.configurationChanged.emit();
    }

    save() {
        if ((!this.saveConfiguration && !this.saveQuery) || !this.dataService.active) {
            return ;
        }

        const storage: GridStorageDto = {
            columns: this.configuration.columns,
            filter: this.currentQuery?.filter,
            order: this.currentQuery?.order,
        }
        this.dataService.save(storage, 'grid', this.configuration.id).subscribe();
    }

    restore(): Observable<any> {
        if ((!this.saveConfiguration && !this.saveQuery) || !this.dataService.active) {
            return of(null);
        }

        return this.dataService.get('grid', this.configuration.id).pipe(
            map((grid: GridStorageDto) => {
                if (!grid) {
                    return ;
                }

                const columns: GridColumnConfigurationDto[] = [];

                if (grid.columns.length !== this.configuration.columns.length) {
                    return ;
                }
                
                for (const column of grid.columns) {
                    const find: GridColumnConfigurationDto = this.configuration.columns.find((c) => 
                        ((column.id && column.id === c.id) || column.key === c.key) && column.type === c.type
                    );

                    if (!find) {
                        return ;
                    }

                    columns.push({
                        ...find,
                        width: column.width,
                        sticky: column.sticky,
                        hide: column.hide
                    });
                }

                if (this.saveConfiguration) {
                    this.configuration.columns = columns;
                }

                if (this.saveQuery && this.currentQuery && 
                    (!_.isEqual(this.currentQuery?.filter, grid.filter) ||
                    !_.isEqual(this.currentQuery?.order, grid.order))) {

                    this.currentQuery.filter = grid.filter;
                    this.currentQuery.order = grid.order;
                }

                return ;
            })
        )
    }

    onSelect(value: boolean) {
        this.select.emit(value);
    }

    onActionClick($event) {
        this.actionClick.emit($event);
    }

    onAddNewRow() {
        this.addNewRow.emit();
    }

    onManageColumn($event) {
        const configurationChanged = new EventEmitter();
        this.showPopup.next({
            component: GridColumnManageComponent,
            event: $event,
            width: 250,
            maxWidth: this.configuration.gridWidth - 10,
            props: {
                configuration: this.configuration,
                configurationChanged
            }
        });
        configurationChanged.subscribe(() => {
            this.save();
            this.configurationChanged.next(this.configuration);
        })
    }

    onQueryChanged() {
        this.currentQuery.skip = 0;
        this.queryChanged.next(this.currentQuery);
    }

    onColumnClick($event, key: string) {
        const column = this.configuration.columns.find((c) => c.key === key);

        if (!this.configuration.headerEditable && !column.filter && !column.sort) {
            return ;
        }

        const queryChanged = new EventEmitter<SysQueryDto>();
        const configurationChanged = new EventEmitter();
        this.showPopup.next({
            component: GridColumnFilterComponent,
            event: $event,
            width: 250,
            maxWidth: this.configuration.gridWidth - 10,
            props: {
                headerEditable: this.configuration.headerEditable,
                currentQuery: this.currentQuery,
                column,
                queryChanged,
                configurationChanged,
            }
        });
        queryChanged.subscribe((dismiss: boolean) => {
            this.save();
            this.currentQuery.skip = 0;
            this.queryChanged.next(this.currentQuery);
            if (dismiss) {
                this.dismissPopup.next(null);
            }
        });
        configurationChanged.subscribe(() => {
            this.save();
            this.configurationChanged.next(this.configuration);
            this.dismissPopup.next(null);
        })
    }

    onClickOutside() {
        this.dismissPopup.next(null);
    }
}