import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InputsGridComponent } from './inputs-grid/inputs-grid.component';
import { TranslateModule } from '@ngx-translate/core';
import { WorkflowDebuggerFrameComponent } from './workflow-debugger-frame/workflow-debugger-frame.component';
import { WorkflowDebuggerLayoutComponent } from './workflow-debugger-layout/workflow-debugger-layout.component';
import { WorkflowContainerModule } from '../workflow-container/workflow-container.module';
import { IonicModule } from '@ionic/angular';
import { InputsSearchComponent } from './inputs-grid/inputs-search/inputs-search.component';
import { SoListModule } from '../@components/so-component/so-list/so-list.module';
import { WorkflowDebuggerService } from './workflow-debugger.service';
import { InputsGridService } from './inputs-grid/inputs-grid.service';
import { SysUtilsService } from '../workflow-interpretor/@utils/sys-utils.service';
import { InputsGridListComponent } from './inputs-grid/inputs-list/inputs-list.component';
import { SoInputModule } from '../@components/so-component/so-input/so-input.module';
import { SoFormModule } from '../@components/so-component/so-form/so-form.module';
import { InputLocationComponent } from './inputs-grid/input-location/input-location.component';
import { InputMagnetComponent } from './inputs-grid/input-magnet/input-magnet.component';
import { PipesModule } from '@algotech/angular';
import { InputQueryComponent } from './inputs-grid/input-query/input-query.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        PipesModule,
        HttpClientModule,
        TranslateModule,
        SoListModule,
        WorkflowContainerModule,
        SoFormModule,
        SoInputModule,
    ],
    declarations: [
        WorkflowDebuggerFrameComponent,
        WorkflowDebuggerLayoutComponent,
        InputsSearchComponent,
        InputsGridComponent,
        InputLocationComponent,
        InputQueryComponent,
        InputsGridListComponent,
        InputMagnetComponent,
    ],
    providers: [
        SysUtilsService,
        WorkflowDebuggerService,
        InputsGridService,
    ],
    exports: [
        WorkflowDebuggerFrameComponent,
        WorkflowDebuggerLayoutComponent,
        InputsSearchComponent,
        InputsGridComponent,
        InputsGridListComponent,
        InputMagnetComponent,
    ]
})
export class WorkflowDebuggerModule { }
