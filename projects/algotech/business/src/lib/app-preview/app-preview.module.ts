import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AppPreviewComponent } from './app-preview.component';
import { NgModule } from '@angular/core';
import { AppModule } from '../app/app.module';

@NgModule({
    imports: [
        CommonModule,
        AppModule,
        IonicModule
    ],
    declarations: [AppPreviewComponent],
    exports: [AppPreviewComponent],
})
export class AppPreviewModule { }
