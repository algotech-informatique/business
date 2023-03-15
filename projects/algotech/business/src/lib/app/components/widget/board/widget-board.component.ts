import { SnPageWidgetDto, ApplicationModelDto, SnPageDto, PairDto, SmartObjectDto } from '@algotech/core';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventData, PageData } from '../../../models';
import { Widget } from '../widget.interface';
import { BoardServiceSelection } from './services/board.selection.service';
import { BoardService } from './services/board.service';

@Component({
    selector: 'widget-board',
    templateUrl: './widget-board.component.html',
    styleUrls: ['./widget-board.component.scss'],
})
export class WidgetBoardComponent implements Widget, OnDestroy {

    constructor(
        public boardService: BoardService,
        private boardSelection: BoardServiceSelection,
        private ref: ChangeDetectorRef) {
    }

    appModel: ApplicationModelDto;
    snPage: SnPageDto;
    readonly: boolean;
    _widget: SnPageWidgetDto;
    event = new EventEmitter<EventData>();
    data = new EventEmitter<PairDto>();
    subscription;

    // custom params

    get widget(): SnPageWidgetDto { return this._widget; }
    set widget(value: SnPageWidgetDto) {
        this._widget = value;
        this.initialize();
    }

    onChanged() {
        this.initialize();
    }

    initialize() {
        const instance = this._widget?.custom?.instance ? this._widget?.custom?.instance : null;
        if (instance === '--') {
            return;
        }

        if (!this.subscription) {
            this.subscription = new Subscription();
            this.subscription = this.boardService.onUpdate.subscribe(() => {
                this.ref.detectChanges();
                this.boardService.initializeDrag(this.appModel, this.snPage, this.widget, this.readonly, this.event);
            });
            this.subscription.add(this.boardService.change(this.appModel.key, this.widget).subscribe());
            this.subscription.add(this.boardSelection.onSelect.subscribe((selection: SmartObjectDto) => {
                this.data.emit({
                    key: 'smart-object-selected',
                    value: selection?.uuid,
                });
            }))
        }

        this.boardService.initializeZones(this.widget, this.appModel).subscribe();
    }

    onOpenActions(event: EventData) {
        this.event.emit(event);
    }

    onAddMagnet(event: EventData) {
        this.event.emit(event);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
