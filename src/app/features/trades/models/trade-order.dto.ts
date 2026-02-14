import { TradeOrderStatus, TradeOrderType, TradePair, TradeSide } from './trade-order.model';

export interface CreateTradeOrderDto {
  pair: TradePair;
  side: TradeSide;
  type: TradeOrderType;
  amount: number;
  price?: number | null;
}

export interface UpdateTradeOrderDto {
  pair: TradePair;
  side: TradeSide;
  type: TradeOrderType;
  amount: number;
  price?: number | null;
  status: TradeOrderStatus;
}
