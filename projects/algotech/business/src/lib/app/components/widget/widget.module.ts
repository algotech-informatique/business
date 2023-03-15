import { PipesModule as AngularPipesModule } from '@algotech/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../../@pipes/pipes.module';
import { WidgetComponent } from './widget.component';
import { WidgetTextComponent } from './text/widget-text.component';
import { WidgetButtonComponent } from './button/widget-button.component';
import { WidgetCustomComponent } from './custom/widget-custom.component';
import { WidgetRectangleComponent } from './shapes/rectangle/widget-rectangle.component';
import { WidgetCircleComponent } from './shapes/circle/widget-circle.component';
import { WidgetPolylineComponent } from './shapes/polyline/widget-polyline.component';
import { IonicModule } from '@ionic/angular';
import { WidgetImageService } from './services/widget-image.service';
import { WidgetImageComponent } from './image/widget-image.component';
import { WidgetDocumentModule } from './document/widget-document.module';
import { AppPipesModule } from '../../pipes/app.pipes.module';
import { AppWidgetDirective } from '../../directives/app-widget.directive';
import { SpinnerModule } from '../../../@components/spinner/spinner.module';
import { WidgetListComponent } from './list/widget-list.component';
import { SoInputModule } from '../../../@components/so-component/so-input/so-input.module';
import { WidgetTabsComponent } from './tabs/widget-tabs.component';
import { WidgetTabComponent } from './tabs/tab/widget-tab.component';
import { WidgetNotificationComponent } from './system/notification/widget-notification.component';
import { NotificationListComponent } from './system/notification/notification-list/notification-list.component';
import { NotificationCardComponent  } from './system/notification/notification-card/notification-card.component';
import { WidgetProfileComponent } from './system/profile/widget-profile.component';
import { WidgetSelectorComponent } from './system/selector/widget-selector.component';
import { ProfilePopupComponent } from './system/profile/profile-popup/profile-popup.component';
import { SelectorPopupComponent } from './system/selector/selector-popup/selector-popup.component';
import { AvatarModule } from 'ngx-avatar';
import { WidgetHeaderComponent } from './header/widget-header.component';
import { WidgetFooterComponent } from './footer/widget-footer.component';
import { WidgetTableComponent } from './table/widget-table.component';
import { GridModule } from '../../../@components/grid/grid.module';
import { WidgetColumnComponent } from './table/column/widget-column.component';
import { DirectivesModule } from '../../../@directives/directives.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        IonicModule,
        PipesModule,
        WidgetDocumentModule,
        AngularPipesModule,
        AppPipesModule,
        SpinnerModule,
        SoInputModule,
        AvatarModule,
        GridModule,
        DirectivesModule
    ],
    declarations: [
        WidgetImageComponent,
        WidgetButtonComponent,
        WidgetCustomComponent,
        WidgetTextComponent,
        WidgetRectangleComponent,
        WidgetCircleComponent,
        WidgetPolylineComponent,
        WidgetListComponent,
        WidgetTableComponent,
        WidgetColumnComponent,
        WidgetNotificationComponent,
        NotificationListComponent,
        NotificationCardComponent,
        WidgetProfileComponent,
        ProfilePopupComponent,
        WidgetSelectorComponent,
        SelectorPopupComponent,
        WidgetComponent,
        WidgetTabsComponent,
        WidgetTabComponent,
        AppWidgetDirective,
        WidgetHeaderComponent,
        WidgetFooterComponent,
    ],
    exports: [
        WidgetImageComponent,
        WidgetButtonComponent,
        WidgetCustomComponent,
        WidgetTextComponent,
        WidgetRectangleComponent,
        WidgetCircleComponent,
        WidgetPolylineComponent,
        WidgetListComponent,
        WidgetTableComponent,
        WidgetNotificationComponent,
        NotificationListComponent,
        NotificationCardComponent,
        WidgetProfileComponent,
        ProfilePopupComponent,
        WidgetSelectorComponent,
        SelectorPopupComponent,
        WidgetComponent,
        WidgetTabsComponent,
        WidgetTabComponent,
        WidgetHeaderComponent,
        WidgetFooterComponent,
    ],
    providers: [
        WidgetImageService,
    ],
})
export class WidgetModule { }
