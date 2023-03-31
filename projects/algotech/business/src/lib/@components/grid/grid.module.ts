import { PipesModule } from '@algotech-ce/angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { DirectivesModule as AngularDirectivesModule } from '@algotech-ce/angular';
import { DirectivesModule } from '../../@directives/directives.module';
import { PopoverModule } from '../popover/popover.module';
import { SoInputModule } from '../so-component/so-input/so-input.module';
import { GridCellValueComponent } from './components/cell-value/grid-cell-value.component';
import { GridCellComponent } from './components/cell/grid-cell.component';
import { GridColumnComponent } from './components/column/grid-column.component';
import { GridGroupComponent } from './components/group/grid-group.component';
import { GridCellValueEditMultipleComponent } from './components/popup/cell-value-edit-multiple/grid-cell-value-edit-multiple.component';
import { GridColumnFilterComponent } from './components/popup/column-filter/grid-column-filter.component';
import { GridColumnManageComponent } from './components/popup/column-manage/grid-column-manage.component';
import { GridRowComponent } from './components/row/grid-row.component';
import { GridComponent } from './grid.component';
import { GridColumnOrderPipe } from './pipes/grid-column-order.pipe';
import { GridIsSelectedPipe } from './pipes/grid-selection.pipe';
import { GridValueFormatPipe } from './pipes/grid-value-format.pipe';
import { GridD3Service } from './services/grid-d3.service';
import { GridUtilsService } from './services/grid-utils.service';
import { GridFiltersComponent } from './components/filters/grid-filters.component';
import { GridCellValuePreventCycleComponent } from './components/cell-value/grid-cell-value.prevent-cycle.component';
@NgModule({
    imports: [
        CommonModule,
        PipesModule,
        IonicModule,
        TranslateModule,
        SoInputModule,
        DirectivesModule,
        AngularDirectivesModule,
        PopoverModule
    ],
    declarations: [
        GridComponent,
        GridGroupComponent,
        GridCellComponent,
        GridCellValueComponent,
        GridRowComponent,
        GridColumnComponent,
        GridIsSelectedPipe,
        GridValueFormatPipe,
        GridColumnFilterComponent,
        GridCellValuePreventCycleComponent,
        GridCellValueEditMultipleComponent,
        GridColumnManageComponent,
        GridFiltersComponent,
        GridColumnOrderPipe,
    ],
    exports: [
        GridComponent,
        GridGroupComponent,
        GridCellComponent,
        GridCellValueComponent,
        GridFiltersComponent,
        GridRowComponent,
    ],
    providers: [
        GridUtilsService,
        GridD3Service
    ],
})
export class GridModule { }
