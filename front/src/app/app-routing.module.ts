import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestGuard } from './core/guards';
import { HomeComponent } from './pages/home/home.component';

/**
 *
 *   { path: 'login',    loadChildren: () => import('./features/auth/auth.module')
 *                         .then((m) => m.AuthModule), canActivate: [GuestGuard] },
 *   { path: 'articles', loadChildren: () => import('./features/articles/articles.module')
 *                         .then((m) => m.ArticlesModule), canActivate: [AuthGuard] },
 *   { path: 'topics',   loadChildren: () => import('./features/topics/topics.module')
 *                         .then((m) => m.TopicsModule), canActivate: [AuthGuard] },
 *   { path: 'profile',  loadChildren: () => import('./features/profile/profile.module')
 *                         .then((m) => m.ProfileModule), canActivate: [AuthGuard] },
 */
const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [GuestGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
