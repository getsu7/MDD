import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/guards';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
    canActivate: [GuestGuard],
  },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'register',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/register/register.module').then(
        (m) => m.RegisterModule
      ),
  },
  {
    path: 'articles/create',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/articles/article-create/article-create.module').then(
        (m) => m.ArticleCreateModule
      ),
  },
  {
    path: 'articles/:id',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/articles/article-detail/article-detail.module').then(
        (m) => m.ArticleDetailModule
      ),
  },
  {
    path: 'articles',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/articles/article-feed/article-feed.module').then(
        (m) => m.ArticleFeedModule
      ),
  },
  {
    path: 'topics',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/topics/topic-list/topic-list.module').then(
        (m) => m.TopicListModule
      ),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/profile/profile/profile.module').then(
        (m) => m.ProfileModule
      ),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
