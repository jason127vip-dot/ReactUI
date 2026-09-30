import { request } from '../utils/api'
import { Customer, CustomerFormValues, CustomerSource, CustomerStatus } from '../views/customers/types'
import { Product, ProductFormValues, ProductStatus } from '../views/products/types'

type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

type ApiCustomer = Omit<Customer, 'id' | 'source' | 'status'> & {
  id: number
  status: string
}

type ApiProduct = Omit<Product, 'id' | 'status'> & {
  id: number
  status: string
}

const toCustomer = (customer: ApiCustomer): Customer => ({
  ...customer,
  id: String(customer.id),
  status: customer.status as CustomerStatus,
  source: CustomerSource.Other,
})

const toProduct = (product: ApiProduct): Product => ({
  ...product,
  id: String(product.id),
  status: product.status as ProductStatus,
})

const customerPayload = (values: CustomerFormValues) => {
  const payload = { ...values }
  delete payload.notes
  return payload
}

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await request.get<ApiResponse<ApiCustomer[]>>('/customers')
  return response.data.map(toCustomer)
}

export const createCustomer = async (values: CustomerFormValues): Promise<Customer> => {
  const response = await request.post<ApiResponse<ApiCustomer>>('/customers', customerPayload(values))
  return toCustomer(response.data)
}

export const updateCustomer = async (id: string, values: CustomerFormValues): Promise<Customer> => {
  const response = await request.put<ApiResponse<ApiCustomer>>(`/customers/${id}`, customerPayload(values))
  return toCustomer(response.data)
}

export const deleteCustomer = async (id: string): Promise<void> => {
  await request.delete<ApiResponse<unknown>>(`/customers/${id}`)
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await request.get<ApiResponse<ApiProduct[]>>('/products')
  return response.data.map(toProduct)
}

export const createProduct = async (values: ProductFormValues): Promise<Product> => {
  const response = await request.post<ApiResponse<ApiProduct>>('/products', values)
  return toProduct(response.data)
}

export const updateProduct = async (id: string, values: ProductFormValues): Promise<Product> => {
  const response = await request.put<ApiResponse<ApiProduct>>(`/products/${id}`, values)
  return toProduct(response.data)
}

export const deleteProduct = async (id: string): Promise<void> => {
  await request.delete<ApiResponse<unknown>>(`/products/${id}`)
}
