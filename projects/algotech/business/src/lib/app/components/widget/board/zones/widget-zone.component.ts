import { ApplicationModelDto, PairDto, SnPageDto, SnPageWidgetDto } from '@algotech/core';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkflowLaunchService } from '../../../../../workflow-launcher/workflow-layout.lancher.service';
import { EventData } from '../../../../models';
import { BoardService } from '../services/board.service';

@Component({
    selector: 'widget-zone',
    templateUrl: './widget-zone.component.html',
    styleUrls: ['./widget-zone.component.scss'],
})
export class WidgetZoneComponent implements AfterViewInit {

    @Input() appModel: ApplicationModelDto;
    @Input() snPage: SnPageDto;
    @Input() board: SnPageWidgetDto;
    @Input() zone: SnPageWidgetDto;
    @Input() readonly: boolean;

    @Output() openActions = new EventEmitter<EventData>();
    @Output() addMagnet = new EventEmitter<EventData>();

    canAddMagnet = false;

    constructor(public boardService: BoardService, private workflowLaucher: WorkflowLaunchService) {
    }

    ngAfterViewInit() {
        const ev = this.board.events.find((e) => e.eventKey.toLowerCase() === 'onaddmagnet');
        this.canAddMagnet = ev?.pipe?.length > 0;
    }

    onOpenActions(event: EventData) {
        this.openActions.emit(event);
    }

    OnAddMagnet(UIEvent: Event) {
        this.workflowLaucher.setSourceValue('magnet-zone', this.magnetZone);
        this.addMagnet.emit({ key: 'onAddMagnet', UIEvent });
    }

    get magnetZone() {
        return {
            appKey: this.appModel.key,
            magnetsZoneKey: this.zone.custom.key,
            boardInstance: this.board.custom.instance,
            order: this.boardService.zones[this.zone.custom.key].smartObjects.length,
            x: -1,
            y: -1
        };
    }
}
