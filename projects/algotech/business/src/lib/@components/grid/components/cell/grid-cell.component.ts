import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'at-grid-cell',
    templateUrl: './grid-cell.component.html',
    styleUrls: ['./grid-cell.component.scss']
})

export class GridCellComponent implements OnInit, AfterViewInit {
    @ViewChild('cell') el: ElementRef;

    @Input()
    width: number;

    @Input()
    hide = false;

    @Input()
    clickable = false;

    @Input()
    editable = false;

    @Output()
    cellClick = new EventEmitter();

    @Output()
    cellDblClick = new EventEmitter();

    ngOnInit() {}

    ngAfterViewInit() {
        this.handleClickAndDoubleClick();
    }

    handleClickAndDoubleClick() {
        const el = this.el.nativeElement;
        const clickEvent = fromEvent<MouseEvent>(el, 'click');
        const dblClickEvent = fromEvent<MouseEvent>(el, 'dblclick');
        const eventsMerged = merge(clickEvent, dblClickEvent).pipe(debounceTime(200));
        eventsMerged.subscribe(
            (event) => {
                if (event.type === 'click') {
                    this.cellClick.emit(event);
                }
                if (event.type === 'dblclick') {
                    this.cellDblClick.emit(event);
                }
            }
        );
    }
}