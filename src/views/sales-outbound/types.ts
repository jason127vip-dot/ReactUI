export enum SalesOutboundStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
}

export interface SalesOutboundLine {
  id: string
  salesOrderLineId: string
  productCode: string
  productName: string
  unit: string
  orderedQuantity: number
  remainingQuantity: number
  outboundQuantity: number
}

export interface SalesOutbound {
  id: string
  outboundNo: string
  salesOrderId: string
  orderNo: string
  customerName: string
  outboundDate: string
  status: SalesOutboundStatus
  lines: SalesOutboundLine[]
  createdAt: string
}

export interface SalesOutboundFormValues {
  salesOrderId: string
  outboundDate: string
  lines: SalesOutboundLine[]
}
