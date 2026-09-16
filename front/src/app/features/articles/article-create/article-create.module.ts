import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ArticleCreateComponent } from './article-create.component';

const routes: Routes = [{ path: '', component: ArticleCreateComponent }];

@NgModule({
  declarations: [ArticleCreateComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ArticleCreateModule {}

