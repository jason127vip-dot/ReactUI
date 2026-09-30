import { request } from '../utils/api'
import { SalesOrder, SalesOrderFormValues, SalesOrderLine, SalesOrderOutboundStatus, SalesOrderPaymentStatus, SalesOrderStatus } from '../views/sales-orders/types'

type ApiResponse<T> = { code: number; message: string; data: T }

type ApiSalesOrder = {
  id: number
  orderNo: string
  customerId: number
  customer: { name: string }
  orderDate: string
  customerPoNo?: string
  expectedOutboundDate?: string
  salesperson?: string
  remarks?: string
  status: string
  totalAmount: number
  totalQuantity: number
  outboundStatus: string
  paymentStatus: string
  paidAmount: number
  unpaidAmount: number
  lines: Array<Omit<SalesOrderLine, 'id' | 'productId'> & { id: number; productId: number }>
  createdAt: string
}

const toOrder = (order: ApiSalesOrder): SalesOrder => ({
  id: String(order.id),
  orderNo: order.orderNo,
  customerId: String(order.customerId),
  customerName: order.customer.name,
  orderDate: order.orderDate.slice(0, 10),
  customerPoNo: order.customerPoNo,
  expectedOutboundDate: order.expectedOutboundDate?.slice(0, 10),
  salesperson: order.salesperson,
  remarks: order.remarks,
  status: order.status as SalesOrderStatus,
  totalAmount: order.totalAmount,
  totalQuantity: order.totalQuantity,
  outboundStatus: order.outboundStatus as SalesOrderOutboundStatus,
  paymentStatus: order.paymentStatus as SalesOrderPaymentStatus,
  paidAmount: order.paidAmount,
  unpaidAmount: order.unpaidAmount,
  lines: order.lines.map(line => ({ ...line, id: String(line.id), productId: String(line.productId) })),
  createdAt: order.createdAt,
})

const payload = (values: SalesOrderFormValues) => ({
  customerId: Number(values.customerId),
  orderDate: values.orderDate,
  customerPoNo: values.customerPoNo,
  expectedOutboundDate: values.expectedOutboundDate,
  salesperson: values.salesperson,
  remarks: values.remarks,
  lines: values.lines.map(line => ({ productId: Number(line.productId), quantity: line.quantity })),
})

export const getSalesOrders = async (): Promise<SalesOrder[]> => {
  const response = await request.get<ApiResponse<ApiSalesOrder[]>>('/sales-orders')
  return response.data.map(toOrder)
}

export const createSalesOrder = async (values: SalesOrderFormValues): Promise<SalesOrder> => {
  const response = await request.post<ApiResponse<ApiSalesOrder>>('/sales-orders', payload(values))
  return toOrder(response.data)
}

export const updateSalesOrder = async (id: string, values: SalesOrderFormValues): Promise<SalesOrder> => {
  const response = await request.put<ApiResponse<ApiSalesOrder>>(`/sales-orders/${id}`, payload(values))
  return toOrder(response.data)
}

export const confirmSalesOrder = async (id: string): Promise<SalesOrder> => {
  const response = await request.post<ApiResponse<ApiSalesOrder>>(`/sales-orders/${id}/confirm`)
  return toOrder(response.data)
}

export const cancelSalesOrderConfirmation = async (id: string): Promise<SalesOrder> => {
  const response = await request.post<ApiResponse<ApiSalesOrder>>(`/sales-orders/${id}/cancel-confirmation`)
  return toOrder(response.data)
}

export const deleteSalesOrder = async (id: string): Promise<void> => {
  await request.delete<ApiResponse<unknown>>(`/sales-orders/${id}`)
}
