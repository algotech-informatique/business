import { NgModule } from '@angular/core';
import { AbsolutePositionPipe } from './absolute-position.pipe';
import { ContentHeightPipe } from './content-height.pipe';
import { InjectStylePipe } from './inject-styles.pipe';
import { ScalePipe } from './scale.pipe';
import { spacingFooterPipe } from './spacing-footer.pipe';
import { TextBooleanPipe } from './text-boolean.pipe';
import { Uuid2ImagePipe } from './uuid2image.pipe';
import { WhiteSpacePipe } from './white-space.pipe';

@NgModule({
    declarations: [
        InjectStylePipe,
        ScalePipe,
        Uuid2ImagePipe,
        TextBooleanPipe,
        WhiteSpacePipe,
        ContentHeightPipe,
        spacingFooterPipe,
        AbsolutePositionPipe,
    ],
    exports: [
        InjectStylePipe,
        ScalePipe,
        Uuid2ImagePipe,
        TextBooleanPipe,
        WhiteSpacePipe,
        ContentHeightPipe,
        spacingFooterPipe,
        AbsolutePositionPipe
    ],
})
export class AppPipesModule { }
