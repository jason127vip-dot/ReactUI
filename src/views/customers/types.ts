export enum CustomerStatus {
  Active = 'active',
  Inactive = 'inactive',
  Prospect = 'prospect',
  InProgress = 'in_progress',
  Churned = 'churned',
}

export enum CustomerSource {
  Website = 'website',
  Referral = 'referral',
  Ads = 'ads',
  Partner = 'partner',
  Other = 'other',
}

export interface Customer {
  id: string
  customerCode: string
  name: string
  contactPerson: string
  phone?: string
  email?: string
  address?: string
  paymentTerms?: string
  status: CustomerStatus
  source: CustomerSource
  owner?: string
  lifetimeValue?: number
  monthlyRecurringRevenue?: number
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface CustomerActivity {
  id: string
  customerId: string
  actor: string
  type: 'note' | 'call' | 'email' | 'deal'
  summary: string
  timestamp: string
  statusAfter?: CustomerStatus
}

export interface CustomerFilters {
  keyword?: string
  status?: CustomerStatus[]
}

export interface CustomerFormValues {
  customerCode: string
  name: string
  contactPerson: string
  phone?: string
  email?: string
  address?: string
  paymentTerms?: string
  status: CustomerStatus
  notes?: string
}
