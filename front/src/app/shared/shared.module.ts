import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [AppHeaderComponent, BackButtonComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    AppHeaderComponent,
    BackButtonComponent,
  ],
})
export class SharedModule {}

