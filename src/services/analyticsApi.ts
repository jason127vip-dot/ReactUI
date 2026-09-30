import { request } from '../utils/api'
import { SalesOrderPaymentReportRow, SalesOrderPaymentStatus } from '../views/sales-order-payment-report/types'

type ApiResponse<T> = { code: number; message: string; data: T }

export interface DashboardStats {
  totalSales: number
  receivedAmount: number
  unpaidAmount: number
  outboundQuantity: number
  recentSalesOrders: Array<{
    id: string
    orderNo: string
    customerName: string
    orderDate: string
    amount: number
    status: string
  }>
  outstandingCustomers: Array<{ name: string; amount: number }>
  dailyOrderVolume: Array<{ date: string; count: number }>
}

type RawDashboardStats = Omit<DashboardStats, 'recentSalesOrders'> & {
  recentSalesOrders: Array<Omit<DashboardStats['recentSalesOrders'][number], 'id'> & { id: number }>
}

type RawReportRow = Omit<SalesOrderPaymentReportRow, 'id' | 'paymentStatus'> & {
  id: number
  paymentStatus: string
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await request.get<ApiResponse<RawDashboardStats>>('/dashboard')
  return {
    ...response.data,
    recentSalesOrders: response.data.recentSalesOrders.map(item => ({ ...item, id: String(item.id) })),
  }
}

export const getSalesOrderPaymentReport = async (): Promise<SalesOrderPaymentReportRow[]> => {
  const response = await request.get<ApiResponse<RawReportRow[]>>('/reports/sales-order-payments')
  return response.data.map(row => ({ ...row, id: String(row.id), paymentStatus: row.paymentStatus as SalesOrderPaymentStatus }))
}
