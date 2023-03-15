import { PipesModule } from '@algotech/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetMagnetComponent } from './magnets/widget-magnet.component';
import { WidgetMagnetPropertyComponent } from './magnets/magnet-property/widget-magnet-property.component';
import { MagnetPipe } from './pipes/magnet.pipe';
import { ZonePipe } from './pipes/zone.pipe';
import { WidgetBoardComponent } from './widget-board.component';
import { WidgetZoneComponent } from './zones/widget-zone.component';
import { AppPipesModule } from '../../../pipes/app.pipes.module';
import { BoardService } from './services/board.service';
import { AuthorizationMoveMagnetPipe } from './pipes/auhtorization-move-magnet.pipe';
import { BoardUtilsService } from './services/board.utils.service';
import { ExtremityPointPipe } from './pipes/extremity-point.pipe';
import { BoardServiceSelection } from './services/board.selection.service';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        PipesModule,
        AppPipesModule
    ],
    exports: [],
    declarations: [
        WidgetBoardComponent,
        WidgetZoneComponent,
        WidgetMagnetComponent,
        WidgetMagnetPropertyComponent,
        MagnetPipe,
        ZonePipe,
        AuthorizationMoveMagnetPipe,
        ExtremityPointPipe
    ],
    providers: [
        BoardService,
        BoardUtilsService,
        BoardServiceSelection,
    ],
})
export class BoardModule { }
