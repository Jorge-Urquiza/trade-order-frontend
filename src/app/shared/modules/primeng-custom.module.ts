import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

const PRIME_NG_MODULES = [
  ButtonModule,
  CardModule,
  DynamicDialogModule,
  InputNumberModule,
  InputTextModule,
  ProgressSpinnerModule,
  SelectModule,
  TableModule,
  TagModule,
  ToastModule,
  ToolbarModule,
];

@NgModule({
  imports: [CommonModule, ...PRIME_NG_MODULES],
  exports: [CommonModule, ...PRIME_NG_MODULES],
})
export class PrimeNgCustomModule {}
