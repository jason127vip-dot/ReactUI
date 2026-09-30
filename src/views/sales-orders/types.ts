export enum SalesOrderStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
}

export type SalesOrderOutboundStatus = 'not_outbound' | 'partially_outbound' | 'fully_outbound'
export type SalesOrderPaymentStatus = 'unpaid' | 'partially_paid' | 'paid'

export interface SalesOrderLine {
  id: string
  productId: string
  productCode: string
  barcode?: string
  productName: string
  specification?: string
  unit: string
  unitPrice: number
  quantity: number
  amount: number
}

export interface SalesOrder {
  id: string
  orderNo: string
  customerId: string
  customerName: string
  orderDate: string
  customerPoNo?: string
  expectedOutboundDate?: string
  salesperson?: string
  remarks?: string
  status: SalesOrderStatus
  totalAmount: number
  totalQuantity?: number
  outboundStatus?: SalesOrderOutboundStatus
  paymentStatus?: SalesOrderPaymentStatus
  paidAmount?: number
  unpaidAmount?: number
  lines: SalesOrderLine[]
  createdAt: string
}

export interface SalesOrderFormValues {
  customerId: string
  orderDate: string
  customerPoNo?: string
  expectedOutboundDate?: string
  salesperson?: string
  remarks?: string
  lines: SalesOrderLine[]
}
