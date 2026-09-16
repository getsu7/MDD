import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ArticleFeedComponent } from './article-feed.component';

const routes: Routes = [{ path: '', component: ArticleFeedComponent }];

@NgModule({
  declarations: [ArticleFeedComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ArticleFeedModule {}

