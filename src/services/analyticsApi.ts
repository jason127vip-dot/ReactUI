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

export type ARAgingBucket = '0-30 Days' | '31-60 Days' | '61-90 Days' | '91-120 Days' | '120+ Days'

export interface ARAgingReportRow {
  id: string
  invoiceNo: string
  orderNo: string
  customerName: string
  invoiceDate: string
  invoiceAmount: number
  paidAmount: number
  outstandingAmount: number
  agingDays: number
  agingBucket: ARAgingBucket
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

export const getARAgingReport = async (): Promise<ARAgingReportRow[]> => {
  const response = await request.get<ApiResponse<Array<Omit<ARAgingReportRow, 'id'> & { id: number }>>>('/reports/ar-aging')
  return response.data.map(row => ({ ...row, id: String(row.id) }))
}
