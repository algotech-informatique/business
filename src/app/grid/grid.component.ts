import { PairDto } from '@algotech/core';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { GridConfigurationDto } from '../../../projects/algotech/business/src/lib/@components/grid/dto/grid-configuration.dto';
import { GridComponent } from '../../../projects/algotech/business/src/lib/@components/grid/grid.component';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss']
})

export class GridPage implements OnInit {
    @ViewChild('grid') grid: GridComponent;

    public data: { id: string; properties: PairDto[] }[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
    ].map((id) => ({
        id,
        properties: ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg'].map((colKey) => ({
            key: colKey,
            value: `${id} - ${colKey} - Valeur`
        }))
    }));

    public icons: PairDto[] = [
        { key: 'any', value: 'fa-solid fa-question' },
        { key: 'string', value: 'fa-solid fa-font string' },
        { key: 'number', value: 'fa-solid fa-arrow-up-9-1 number' },
        { key: 'datetime', value: 'fa-solid fa-calendar-days datetime' },
        { key: 'date', value: 'fa-solid fa-calendar-days date' },
        { key: 'time', value: 'fa-solid fa-clock' },
        { key: 'boolean', value: 'fa-solid fa-toggle-on boolean' },
        { key: 'html', value: 'fa-solid fa-code' },
        { key: 'so:*', value: 'fa-solid fa-cube fa-blue' },
    ];

    public configuration: GridConfigurationDto = {
        id: 'a',
        search: true,
        rowHeight: 40,
        colSelectable: false,
        headerEditable: true,
        reorder: true,
        selection: {
            multiselection: true,
            selected: [],
            list: ['01', '02']
        },
        columns: [{
            key: 'aa',
            name: 'AA',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 50,
            sticky: 'none'
        }, {
            key: 'bb',
            name: 'BB',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 110,
            sticky: 'none'
        }, {
            key: 'cc',
            name: 'CC',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 350,
            sticky: 'none'
        }],
        icons: this.icons,
        hasActions: true,
    };

    public configuration2: GridConfigurationDto = {
        id: 'b',
        search: true,
        rowHeight: 40,
        headerEditable: true,
        reorder: true,
        selection: {
            multiselection: true,
            selected: [],
            list: ['01', '02']
        },
        columns: [{
            key: 'aa',
            name: 'AA',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 50,
            sticky: 'none'
        }, {
            key: 'bb',
            name: 'BB',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 100,
            sticky: 'none'
        }, {
            key: 'cc',
            name: 'CC',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 250,
            sticky: 'none'
        }, {
            key: 'dd',
            name: 'DD',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 250,
            sticky: 'none'
        }, {
            key: 'ee',
            name: 'EE',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 50,
            sticky: 'none'
        }, {
            key: 'ff',
            name: 'FF',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 50,
            sticky: 'none'
        },],
        icons: this.icons,
        hasActions: true,
    };

    public configuration3: GridConfigurationDto = {
        id: 'c',
        search: true,
        rowHeight: 40,
        headerEditable: true,
        reorder: true,
        selection: {
            multiselection: false,
            selected: null,
            list: ['01', '02']
        },
        columns: [{
            key: 'aa',
            name: 'AA',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 150,
            selected: true,
            sticky: 'none'
        }, {
            key: 'bb',
            name: 'BB',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 110,
            sticky: 'none'
        },],
        icons: this.icons
    };

    public configuration4: GridConfigurationDto = {
        id: 'd',
        search: true,
        rowHeight: 40,
        colSelectable: true,
        headerEditable: true,
        reorder: true,
        columns: [{
            key: 'aa',
            name: 'AA',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 150,
            selected: true,
            sticky: 'none'
        }, {
            key: 'bb',
            name: 'BB',
            multiple: false,
            resize: true,
            filter: true,
            sort: true,
            type: 'string',
            width: 110,
            sticky: 'none'
        },],
        icons: this.icons
    };

    constructor(private ref: ChangeDetectorRef) { }

    ngOnInit() { }

    onConfigurationChanged() {
        console.log('onConfigurationChanged');
    }

    onAddNewRow() {
        const id = UUID.UUID();
        this.data.push({
            id,
            properties: ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg'].map((colKey) => ({
                key: colKey,
                value: `${id} - ${colKey} - Valeur`
            }))
        });

        this.ref.detectChanges();
        setTimeout(() => {
            this.grid.focus(id, 'aa', 'bottom');
        }, 0);
    }

    onCellClick($event) {
        console.log('click cell');
    }

    onCellChange(value: any) {
        console.log('value', value);
    }
}
