export interface SalesInvoiceLine {
  id: number
  productCode: string
  productName: string
  specification: string
  unit: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface SalesInvoice {
  id: number
  invoiceNo: string
  salesOutboundId: number
  salesOutbound: { outboundNo: string }
  salesOrderId: number
  salesOrder: { orderNo: string }
  invoiceDate: string
  customerName: string
  customerAddress: string
  customerPoNo: string
  paymentTerms: string
  remarks: string
  status: 'draft' | 'confirmed'
  totalAmount: number
  paidAmount: number
  unpaidAmount: number
  lines: SalesInvoiceLine[]
}

export interface InvoiceOutbound {
  id: number
  outboundNo: string
  salesOrder: { orderNo: string; customer: { name: string } }
  lines: Array<{
    id: number
    outboundQuantity: number
    salesOrderLine: { productCode: string; productName: string; unit: string; unitPrice: number }
  }>
}

export interface SalesInvoiceFormValues {
  salesOutboundId: number
  invoiceDate: string
  remarks: string
}
