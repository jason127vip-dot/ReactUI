import { request } from '../utils/api'

type R<T> = { code: number; message: string; data: T }

export type CustomerCredit = {
  customerId: number
  customerCode: string
  customerName: string
  customerStatus: string
  creditLimit: number
  usedCredit: number
  availableCredit: number
  status: 'available' | 'exceeded' | 'not_configured'
}

export type CreditSummary = {
  branchId: number
  enableCreditControl: boolean
  totalCreditLimit: number
  allocatedCredit: number
  unallocatedCredit: number
  customers: CustomerCredit[]
}

export const getCreditSummary = async () => (await request.get<R<CreditSummary>>('/customer-credits')).data

export const setCustomerCreditLimit = async (customerId: number, creditLimit: number) => {
  await request.put(`/customer-credits/${customerId}`, { creditLimit })
}
