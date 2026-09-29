export enum SalesOrderStatus {
  Draft = 'draft',
  Confirmed = 'confirmed',
}

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
  status: SalesOrderStatus
  totalAmount: number
  lines: SalesOrderLine[]
  createdAt: string
}

export interface SalesOrderFormValues {
  customerId: string
  orderDate: string
  lines: SalesOrderLine[]
}
