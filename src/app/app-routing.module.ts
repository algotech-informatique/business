import { SignInGuard } from '@algotech/angular';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppPreviewComponent, EncodeGuard, ThemeResolver,
    WorkflowDebuggerFrameComponent } from '../../projects/algotech/business/public_api';
import { SmartLinkComponent } from '../../projects/algotech/business/src/lib/smartlink/smartlink.component';
import { AppViewerPageComponent } from './app/app-viewer.page';

const routes: Routes = [
    { path: '', redirectTo: 'player', pathMatch: 'full' },
    { path: 'debugger', component: WorkflowDebuggerFrameComponent,  },
    { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
    { path: 'player', loadChildren: () => import('./player/player.module').then(m => m.PlayerPageModule), canActivate: [SignInGuard] },
    { path: 'grid', loadChildren: () => import('./grid/grid.module').then(m => m.GridPageModule) },
    { path: 'app-viewer', component: AppViewerPageComponent, canActivate: [SignInGuard] },
    { path: 'app/:keyApp', component: AppPreviewComponent, canActivate: [SignInGuard] },
    { path: 'app/:keyApp/:keyPage', component: AppPreviewComponent, canActivate: [SignInGuard, EncodeGuard] },
    {
        path: 'smartlink/:token', component: SmartLinkComponent,
        resolve: {
            theme: ThemeResolver
        },
        canActivate: [SignInGuard]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: false })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
