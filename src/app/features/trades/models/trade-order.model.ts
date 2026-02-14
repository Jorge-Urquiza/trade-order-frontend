export type TradePair = 'BTCUSD' | 'EURUSD' | 'ETHUSD';
export type TradeSide = 'buy' | 'sell';
export type TradeOrderType = 'limit' | 'market' | 'stop';
export type TradeOrderStatus = 'open' | 'cancelled' | 'executed';

export interface TradeOrder {
  id: number | string;
  pair: TradePair;
  side: TradeSide;
  type: TradeOrderType;
  amount: number;
  price: number | null;
  status: TradeOrderStatus;
  createdAt: string;
  updatedAt: string;
}
