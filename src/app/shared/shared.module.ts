import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PageHeaderComponent } from './components/page-header/page-header.component';
import { PrimeNgCustomModule } from './modules/primeng-custom.module';

@NgModule({
  declarations: [PageHeaderComponent],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PrimeNgCustomModule],
  exports: [CommonModule, RouterModule, ReactiveFormsModule, PrimeNgCustomModule, PageHeaderComponent],
})
export class SharedModule {}
