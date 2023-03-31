import { ApplicationModelDto, PairDto, SmartObjectDto, SnPageDto, SnPageWidgetDto, ZoneDto } from '@algotech-ce/core';
import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { SoUtilsService } from '../../../../../workflow-interpretor/@utils/so-utils.service';
import { SysUtilsService } from '../../../../../workflow-interpretor/@utils/sys-utils.service';
import { WorkflowLaunchService } from '../../../../../workflow-launcher/workflow-layout.lancher.service';
import { EventData } from '../../../../models';
import { PageEventsService } from '../../../../services/page-events.service';
import { BoardServiceSelection } from '../services/board.selection.service';
import { BoardUtilsService } from '../services/board.utils.service';

@Component({
    selector: 'magnet',
    templateUrl: './widget-magnet.component.html',
    styleUrls: ['./widget-magnet.component.scss']
})
export class WidgetMagnetComponent implements AfterViewInit {

    @Input() appModel: ApplicationModelDto;
    @Input() snPage: SnPageDto;
    @Input() template: SnPageWidgetDto;
    @Input() zone: SnPageWidgetDto;
    @Input() board: SnPageWidgetDto;
    @Input() smartObject: SmartObjectDto;
    @Input() readonly: boolean;

    @Output() openActions = new EventEmitter<EventData>();

    hasActions = false;

    constructor(
        public boardSelection: BoardServiceSelection,
        private boardUtils: BoardUtilsService,
        private workflowLaucher: WorkflowLaunchService,
        private pageEventsService: PageEventsService,
        private sysUtils: SysUtilsService,
        private soUtils: SoUtilsService) { }

    onOpenActions(UIEvent: Event) {
        this.workflowLaucher.setAdditional('smart-object', this.smartObject);
        this.workflowLaucher.setAdditional('smart-model', this.soUtils.getModel(this.smartObject.modelKey));

        this.workflowLaucher.setSourceValue('smart-object-selected', this.smartObject.uuid);
        this.workflowLaucher.setSourceValue('magnet-zone', this.magnetZone);

        if (this.template) {
            const inherit = this.pageEventsService.resolveEvents(this.appModel, this.snPage, this.template.events, this.readonly);
            this.openActions.emit({ key: 'onActionMagnet', UIEvent, inherit });
        } else {
            this.openActions.emit({ key: 'onActionMagnet', UIEvent });
        }
    }

    ngAfterViewInit() {
        const ev = (this.template ? this.template : this.board).events.find((e) => e.eventKey.toLowerCase() === 'onactionmagnet');
        this.hasActions = ev?.pipe?.length > 0;
    }

    get magnetZone() {
        return this.sysUtils.transform(
            this.smartObject.skills.atMagnet.zones.find((z) =>
                this.boardUtils.predicateZone(z, this.appModel.key, this.board.custom?.instance, this.zone.custom?.key)),
                'sys:magnet'
        );
    }
}
