import { request } from '../utils/api'
import { SalesOrderPaymentReportRow, SalesOrderPaymentStatus } from '../views/sales-order-payment-report/types'

type ApiResponse<T> = { code: number; message: string; data: T }

export interface DashboardStats {
  totalSales: number
  receivedAmount: number
  unpaidAmount: number
  outboundQuantity: number
  recentActivities: Array<{ id: string; actor: string; summary: string; timestamp: string }>
  outstandingCustomers: Array<{ name: string; amount: number }>
  revenueTrend: Array<{ month: string; revenue: number }>
  sourceDistribution: Array<{ type: string; value: number }>
}

type RawDashboardStats = Omit<DashboardStats, 'recentActivities'> & {
  recentActivities: Array<{ id: number; actor: string; summary: string; timestamp: string }>
}

type RawReportRow = Omit<SalesOrderPaymentReportRow, 'id' | 'paymentStatus'> & {
  id: number
  paymentStatus: string
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await request.get<ApiResponse<RawDashboardStats>>('/dashboard')
  return {
    ...response.data,
    recentActivities: response.data.recentActivities.map(item => ({ ...item, id: String(item.id) })),
    revenueTrend: [],
    sourceDistribution: [],
  }
}

export const getSalesOrderPaymentReport = async (): Promise<SalesOrderPaymentReportRow[]> => {
  const response = await request.get<ApiResponse<RawReportRow[]>>('/reports/sales-order-payments')
  return response.data.map(row => ({ ...row, id: String(row.id), paymentStatus: row.paymentStatus as SalesOrderPaymentStatus }))
}
