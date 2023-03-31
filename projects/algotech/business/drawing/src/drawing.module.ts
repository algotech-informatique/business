import { DirectivesModule } from '@algotech-ce/angular';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DrawingD3EventService, DrawingMathService, DrawingLinesService, DrawingSelectorService,
    DrawingService, DrawingDragService, DrawingUtilsService } from './services';
import { ToolBoxDrawingPenComponent } from './toolbox/toolbox-drawing/toolbox-drawing-pen/toolbox-drawing-pen.component';
import { ToolBoxDrawingComponent } from './toolbox/toolbox-drawing/toolbox-drawing.component';
import { ToolBoxItemComponent } from './toolbox/toolbox-item/toolbox-item.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        DirectivesModule
    ],
    declarations: [
        ToolBoxDrawingComponent,
        ToolBoxDrawingPenComponent,
        ToolBoxItemComponent,
    ],
    exports: [
        ToolBoxDrawingComponent,
        ToolBoxItemComponent
    ]
})
export class DrawingModule {

    public static forRoot(): ModuleWithProviders<DrawingModule> {
        return {
            ngModule: DrawingModule,
            providers: [
                DrawingService,
                DrawingLinesService,
                DrawingD3EventService,
                DrawingSelectorService,
                DrawingDragService,
                DrawingMathService,
                DrawingUtilsService
            ]
        };
    }
}
