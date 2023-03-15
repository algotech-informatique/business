import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from '@algotech/angular';
import { PageEventsService } from './services/page-events.service';
import { PageCustomService } from './services/page-custom.service';
import { PageLayoutComponent } from '../app/components/page-layout/page-layout.component';
import { BoardModule } from './components/widget/board/board.module';
import { AppPipesModule } from './pipes/app.pipes.module';
import { SocketSmartObjectsService } from './services/sockets-smart-objects.service';
import { PageZoomService } from './services/page-zoom.service';
import { PageUtilsService } from './services/page-utils.service';
import { SocketDocumentsService } from './services/sockets-documents.service';
import { FormsModule } from '@angular/forms';
import { SpinnerModule } from '../@components/spinner/spinner.module';
import { PageRulesService } from './services/page-rules.service';
import { WidgetModule } from './components/widget/widget.module';
import { ActionsLauncherComponent } from './components/actions-launcher/actions-launcher.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        IonicModule,
        PipesModule,
        BoardModule,
        WidgetModule,
        SpinnerModule,
        AppPipesModule,
    ],
    declarations: [
        PageLayoutComponent,
        ActionsLauncherComponent,
    ],
    exports: [
        PageLayoutComponent,
    ],
    providers: [
        PageEventsService,
        PageCustomService,
        PageZoomService,
        PageUtilsService,
        PageRulesService,
        SocketSmartObjectsService,
        SocketDocumentsService,
    ]
})
export class AppModule { }
