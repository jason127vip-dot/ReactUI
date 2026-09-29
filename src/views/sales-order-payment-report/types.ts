export enum SalesOrderPaymentStatus {
  Unpaid = 'unpaid',
  PartiallyPaid = 'partially_paid',
  Paid = 'paid',
}

export interface SalesOrderPaymentReportRow {
  id: string
  orderNo: string
  customerName: string
  orderDate: string
  orderAmount: number
  paidAmount: number
  unpaidAmount: number
  lastPaymentDate?: string
  paymentStatus: SalesOrderPaymentStatus
}
