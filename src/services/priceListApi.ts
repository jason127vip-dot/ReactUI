import { request } from '../utils/api'

type ApiResponse<T> = { code: number; message: string; data: T }

type ApiPriceList = {
  id: number
  customerId: number
  customer: { customerCode: string; name: string }
  productId: number
  product: { productCode: string; name: string; specification?: string }
  startDate: string
  endDate: string
  unitPrice: number
}

export type PriceList = {
  id: string
  customerId: string
  customerCode: string
  customerName: string
  productId: string
  productCode: string
  productName: string
  specification?: string
  startDate: string
  endDate: string
  unitPrice: number
}

export type PriceListValues = Pick<PriceList, 'customerId' | 'productId' | 'startDate' | 'endDate' | 'unitPrice'>

const toPriceList = (row: ApiPriceList): PriceList => ({
  id: String(row.id),
  customerId: String(row.customerId),
  customerCode: row.customer.customerCode,
  customerName: row.customer.name,
  productId: String(row.productId),
  productCode: row.product.productCode,
  productName: row.product.name,
  specification: row.product.specification,
  startDate: row.startDate.slice(0, 10),
  endDate: row.endDate.slice(0, 10),
  unitPrice: row.unitPrice,
})

const payload = (values: PriceListValues) => ({ ...values, customerId: Number(values.customerId), productId: Number(values.productId) })

export const getPriceLists = async () => {
  const response = await request.get<ApiResponse<ApiPriceList[]>>('/price-lists')
  return response.data.map(toPriceList)
}
export const createPriceList = (values: PriceListValues) => request.post('/price-lists', payload(values))
export const updatePriceList = (id: string, values: PriceListValues) => request.put(`/price-lists/${id}`, payload(values))
export const deletePriceList = (id: string) => request.delete(`/price-lists/${id}`)
export const resolveSalesPrice = async (customerId: string, productId: string, date: string) => {
  const response = await request.get<ApiResponse<{ unitPrice: number; source: 'price_list' | 'default' }>>('/price-lists/resolve', {
    params: { customerId, productId, date },
  })
  return response.data
}
