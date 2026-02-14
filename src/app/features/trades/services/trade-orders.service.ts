import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiConfigService } from '../../../core/services/api-config.service';
import { SKIP_GLOBAL_ERROR_TOAST } from '../../../core/services/http-error.interceptor';
import { SKIP_LOADING } from '../../../core/services/http-loading.interceptor';
import { CreateTradeOrderDto, UpdateTradeOrderDto } from '../models/trade-order.dto';
import { TradeOrder } from '../models/trade-order.model';

@Injectable({
  providedIn: 'root',
})
export class TradeOrdersService {
  private readonly endpoint: string;
  private readonly requestContext = new HttpContext()
    .set(SKIP_GLOBAL_ERROR_TOAST, true)
    .set(SKIP_LOADING, true);

  public constructor(
    private readonly http: HttpClient,
    apiConfigService: ApiConfigService,
  ) {
    this.endpoint = apiConfigService.buildUrl('trade-orders');
  }

  public getTradeOrders(): Observable<TradeOrder[]> {
    return this.http.get<TradeOrder[]>(this.endpoint, { context: this.requestContext });
  }

  public createTradeOrder(payload: CreateTradeOrderDto): Observable<TradeOrder> {
    return this.http.post<TradeOrder>(this.endpoint, payload, { context: this.requestContext });
  }

  public updateTradeOrder(id: number | string, payload: UpdateTradeOrderDto): Observable<TradeOrder> {
    return this.http.put<TradeOrder>(`${this.endpoint}/${id}`, payload, { context: this.requestContext });
  }

  public deleteTradeOrder(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`, { context: this.requestContext });
  }
}
