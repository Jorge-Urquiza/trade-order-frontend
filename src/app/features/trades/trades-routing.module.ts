import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TradesListComponent } from './pages/trades-list/trades-list.component';

const routes: Routes = [
  { path: '', component: TradesListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TradesRoutingModule {}
