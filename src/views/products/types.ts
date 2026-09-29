export enum ProductStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export interface Product {
  id: string
  productCode: string
  barcode?: string
  name: string
  specification?: string
  unit: string
  unitPrice: number
  status: ProductStatus
  createdAt: string
  updatedAt?: string
}

export interface ProductFilters {
  keyword?: string
  status?: ProductStatus[]
}

export interface ProductFormValues {
  productCode: string
  barcode?: string
  name: string
  specification?: string
  unit: string
  unitPrice: number
  status: ProductStatus
}
