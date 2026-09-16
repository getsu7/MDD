import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { TopicListComponent } from './topic-list.component';

const routes: Routes = [{ path: '', component: TopicListComponent }];

@NgModule({
  declarations: [TopicListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class TopicListModule {}

