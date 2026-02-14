import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, take } from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { TradeOrder, TradeOrderStatus, TradeOrderType, TradeSide } from '../../models/trade-order.model';
import { TradesEditComponent } from '../trades-edit/trades-edit.component';
import { TradesNewComponent } from '../trades-new/trades-new.component';
import { TradeOrdersService } from '../../services/trade-orders.service';

@Component({
  selector: 'app-trades-list',
  templateUrl: './trades-list.component.html',
  styleUrl: './trades-list.component.scss',
  standalone: false,
})
export class TradesListComponent implements OnInit {
  public trades: TradeOrder[] = [];
  public loading = false;
  public deletingTradeId: number | string | null = null;
  private tradeDialogRef: DynamicDialogRef | null = null;

  public constructor(
    private readonly tradeOrdersService: TradeOrdersService,
    private readonly messageService: MessageService,
    private readonly dialogService: DialogService,
  ) {}

  public ngOnInit(): void {
    this.loadTrades();
  }

  public ngOnDestroy(): void {
    this.tradeDialogRef?.close();
    this.tradeDialogRef = null;
  }

  public openNewTradeDialog(): void {
    this.tradeDialogRef = this.dialogService.open(TradesNewComponent, {
      header: 'New Trade',
      modal: true,
      closable: true,
      width: '52rem',
      breakpoints: {
        '960px': '90vw',
        '640px': '96vw',
      },
    });

    this.tradeDialogRef?.onClose.pipe(take(1)).subscribe(result => {
      if (result?.created) {
        this.loadTrades();
      }
      this.tradeDialogRef = null;
    });
  }

  public openEditTradeDialog(trade: TradeOrder): void {
    this.tradeDialogRef = this.dialogService.open(TradesEditComponent, {
      header: `Edit Trade #${trade.id}`,
      modal: true,
      closable: true,
      width: '52rem',
      breakpoints: {
        '960px': '90vw',
        '640px': '96vw',
      },
      data: { trade },
    });

    this.tradeDialogRef?.onClose.pipe(take(1)).subscribe(result => {
      if (result?.updated) {
        this.loadTrades();
      }
      this.tradeDialogRef = null;
    });
  }

  public deleteTrade(trade: TradeOrder): void {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete trade #${trade.id} (${trade.pair})?`,
    );

    if (!confirmDelete) {
      return;
    }

    this.deletingTradeId = trade.id;

    this.tradeOrdersService
      .deleteTradeOrder(trade.id)
      .pipe(finalize(() => (this.deletingTradeId = null)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Trade deleted',
            detail: `Trade #${trade.id} was deleted successfully.`,
          });
          this.loadTrades();
        },
        error: (error: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Could not delete trade',
            detail: this.extractErrorMessage(error),
          });
        },
      });
  }

  public loadTrades(): void {
    this.loading = true;

    this.tradeOrdersService
      .getTradeOrders()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          this.trades = this.normalizeTradesResponse(response);
        },
        error: (error: HttpErrorResponse) => {
          this.trades = [];

          this.messageService.add({
            severity: 'error',
            summary: 'Could not load trades',
            detail: this.extractErrorMessage(error),
          });
        },
      });
  }

  public trackByTradeId(index: number, trade: TradeOrder): number | string {
    return trade.id ?? index;
  }

  public statusSeverity(status: TradeOrderStatus): 'info' | 'warn' | 'success' | 'danger' {
    const map: Record<TradeOrderStatus, 'info' | 'warn' | 'success' | 'danger'> = {
      open: 'info',
      cancelled: 'warn',
      executed: 'success',
    };

    return map[status] ?? 'info';
  }

  public sideSeverity(side: TradeSide): 'success' | 'danger' {
    return side === 'buy' ? 'success' : 'danger';
  }

  public typeSeverity(type: TradeOrderType): 'info' | 'warn' {
    return type === 'market' ? 'warn' : 'info';
  }

  public formatPrice(price: number | null): string {
    return price === null ? '-' : price.toFixed(5);
  }

  private normalizeTradesResponse(response: unknown): TradeOrder[] {
    if (Array.isArray(response)) {
      return response as TradeOrder[];
    }

    if (response && typeof response === 'object') {
      const payload = response as Record<string, unknown>;
      const listCandidate = [payload['data'], payload['items'], payload['results']].find(Array.isArray);

      if (Array.isArray(listCandidate)) {
        return listCandidate as TradeOrder[];
      }
    }

    this.messageService.add({
      severity: 'warn',
      summary: 'Unexpected response format',
      detail: 'Trade list response is not an array. Showing empty list.',
    });

    return [];
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const message = error.error['message'];

      if (Array.isArray(message) && message.length > 0) {
        return String(message[0]);
      }

      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    return 'Unexpected error loading trade orders.';
  }
}
