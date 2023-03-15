import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GridModule } from '../../../projects/algotech/business/src/lib/@components/grid/grid.module';
import { GridPage } from './grid.component';
import { PipesModule } from '@algotech/angular';

const routes: Routes = [
    {
        path: '',
        component: GridPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        GridModule,
        PipesModule,
        RouterModule.forChild(routes),
    ],
    declarations: [GridPage],
    exports: []
})
export class GridPageModule { }
