import { NgModule } from '@angular/core';
import { GetUserNamePipe } from './get-user-name.pipe';
import { IsImagePipe } from './is-image.pipe';
import { SysFileToUriPipe } from './sys-file-to-uri.pipe';

@NgModule({
    imports: [],
    exports: [
        IsImagePipe,
        SysFileToUriPipe,
        GetUserNamePipe,
    ],
    declarations: [
        IsImagePipe,
        SysFileToUriPipe,
        GetUserNamePipe,
    ],
    providers: [],
})
export class PipesModule { }
