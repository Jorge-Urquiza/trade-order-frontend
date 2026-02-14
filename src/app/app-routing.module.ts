import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'trades' },
  {
    path: 'trades',
    loadChildren: () => import('./features/trades/trades.module').then(m => m.TradesModule),
  },
  { path: '**', redirectTo: 'trades' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
