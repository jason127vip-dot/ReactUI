export enum PaymentStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
}

export interface Payment {
  id: string
  salesInvoiceId?: string
  invoiceNo?: string
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

export interface PaymentInvoiceSummary {
  id: string
  orderNo: string
  customerName: string
  salesOrderId: string
  invoiceNo: string
  invoiceAmount: number
  legacyPaidAmount: number
  paidAmount: number
  unpaidAmount: number
}

export interface PaymentFormValues {
  salesInvoiceId: string
  paymentDate: string
  amount: number
  method: string
  referenceNo?: string
}
