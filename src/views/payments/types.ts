export enum PaymentStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
}

export interface Payment {
  id: string
  paymentNo: string
  salesOrderId: string
  orderNo: string
  customerName: string
  paymentDate: string
  amount: number
  method: string
  referenceNo?: string
  status: PaymentStatus
  createdAt: string
}

export interface PaymentOrderSummary {
  id: string
  orderNo: string
  customerName: string
  orderAmount: number
  paidAmount: number
  unpaidAmount: number
}

export interface PaymentFormValues {
  salesOrderId: string
  paymentDate: string
  amount: number
  method: string
  referenceNo?: string
}
