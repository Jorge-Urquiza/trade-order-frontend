import { NgModule } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';

import { SharedModule } from '../../shared/shared.module';
import { TradesRoutingModule } from './trades-routing.module';
import { TradesEditComponent } from './pages/trades-edit/trades-edit.component';
import { TradesListComponent } from './pages/trades-list/trades-list.component';
import { TradesNewComponent } from './pages/trades-new/trades-new.component';

@NgModule({
  declarations: [TradesListComponent, TradesNewComponent, TradesEditComponent],
  imports: [SharedModule, TradesRoutingModule],
  providers: [DialogService],
})
export class TradesModule {}
