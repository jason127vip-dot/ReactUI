import { request } from '../utils/api'
import type { InvoiceOutbound, SalesInvoice, SalesInvoiceFormValues } from '../views/sales-invoices/types'

type R<T> = { data: T }
export const getSalesInvoices = async () => (await request.get<R<SalesInvoice[]>>('/sales-invoices')).data
export const getInvoiceOutbounds = async () => (await request.get<R<InvoiceOutbound[]>>('/sales-invoices/available-outbounds')).data
export const createSalesInvoice = async (values: SalesInvoiceFormValues) => (await request.post<R<SalesInvoice>>('/sales-invoices', values)).data
export const updateSalesInvoice = async (id: number, values: SalesInvoiceFormValues) => (await request.put<R<SalesInvoice>>(`/sales-invoices/${id}`, values)).data
export const confirmSalesInvoice = async (id: number) => { await request.post(`/sales-invoices/${id}/confirm`) }
export const cancelSalesInvoiceConfirmation = async (id: number) => { await request.post(`/sales-invoices/${id}/cancel-confirmation`) }
export const deleteSalesInvoice = async (id: number) => { await request.delete(`/sales-invoices/${id}`) }
