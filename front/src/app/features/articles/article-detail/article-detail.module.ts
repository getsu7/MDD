import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ArticleDetailComponent } from './article-detail.component';

const routes: Routes = [{ path: '', component: ArticleDetailComponent }];

@NgModule({
  declarations: [ArticleDetailComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ArticleDetailModule {}

