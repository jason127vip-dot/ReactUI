import { Customer, CustomerActivity, CustomerFormValues, CustomerSource, CustomerStatus } from '../views/customers/types'
import { Product, ProductFormValues, ProductStatus } from '../views/products/types'
import { SalesOrder, SalesOrderFormValues, SalesOrderStatus } from '../views/sales-orders/types'
import { SalesOutbound, SalesOutboundFormValues, SalesOutboundLine, SalesOutboundStatus } from '../views/sales-outbound/types'
import { Payment, PaymentFormValues, PaymentOrderSummary, PaymentStatus } from '../views/payments/types'
import { SalesOrderPaymentReportRow, SalesOrderPaymentStatus } from '../views/sales-order-payment-report/types'
import type { Role, RoleDetail, Permission, RoleFormValues } from '../views/team/types'

const sleep = (delay = 320) => new Promise(resolve => setTimeout(resolve, delay))

const randomId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

const createActivity = (
  customerId: string,
  summary: string,
  options: { actor?: string; type?: CustomerActivity['type']; statusAfter?: CustomerStatus } = {},
): CustomerActivity => ({
  id: `ACT-${randomId()}`,
  customerId,
  actor: options.actor ?? 'System',
  type: options.type ?? 'note',
  summary,
  timestamp: new Date().toISOString(),
  statusAfter: options.statusAfter,
})

const seededCustomers: Customer[] = [
  {
    id: 'CUS-1001',
    customerCode: 'CUS-1001',
    name: 'Acme Corp',
    contactPerson: 'Alex Morgan',
    email: 'ops@acme.com',
    phone: '+1 415-555-1010',
    address: '100 Market Street, San Francisco, CA',
    paymentTerms: 'Net 30',
    source: CustomerSource.Website,
    status: CustomerStatus.Active,
    owner: 'Jamie Lee',
    lifetimeValue: 48000,
    monthlyRecurringRevenue: 4000,
    notes: 'Enterprise plan. Weekly sync on Mondays.',
    createdAt: '2024-03-12T10:00:00Z',
    updatedAt: '2024-11-02T08:10:00Z',
  },
  {
    id: 'CUS-1002',
    customerCode: 'CUS-1002',
    name: 'Nova Retail',
    contactPerson: 'Sofia Bennett',
    email: 'cto@novaretail.io',
    phone: '+44 20 7946 0890',
    address: '20 Finsbury Square, London',
    paymentTerms: 'Net 45',
    source: CustomerSource.Referral,
    status: CustomerStatus.Active,
    owner: 'Iris Chen',
    lifetimeValue: 18000,
    monthlyRecurringRevenue: 1500,
    notes: 'Evaluating automation workflow add-on.',
    createdAt: '2024-08-01T15:30:00Z',
  },
  {
    id: 'CUS-1003',
    customerCode: 'CUS-1003',
    name: 'BrightPath Health',
    contactPerson: 'Jordan Patel',
    email: 'product@brightpath.health',
    phone: '+1 312-555-9823',
    address: '250 Lake Street, Chicago, IL',
    paymentTerms: 'Net 30',
    source: CustomerSource.Ads,
    status: CustomerStatus.Inactive,
    owner: 'Jamie Lee',
    notes: 'Needs HIPAA appendix. Follow-up scheduled next week.',
    createdAt: '2024-10-05T12:20:00Z',
  },
  {
    id: 'CUS-1004',
    customerCode: 'CUS-1004',
    name: 'Atlas Logistics',
    contactPerson: 'Riley Wong',
    email: 'finance@atlaslogi.st',
    phone: '+61 2 9374 4000',
    address: '88 Harbour Road, Sydney, NSW',
    paymentTerms: 'Net 60',
    source: CustomerSource.Partner,
    status: CustomerStatus.Active,
    owner: 'Marco Díaz',
    lifetimeValue: 6200,
    monthlyRecurringRevenue: 520,
    notes: 'Regional rollout underway, upsell alert for Q1.',
    createdAt: '2023-12-19T09:45:00Z',
    updatedAt: '2024-10-28T11:15:00Z',
  },
]

let customers = [...seededCustomers]

let products: Product[] = [
  {
    id: 'PRD-1001',
    productCode: 'PRD-1001',
    barcode: '6900000001001',
    name: 'Wireless Barcode Scanner',
    specification: 'Model X200, Black',
    unit: 'pcs',
    unitPrice: 680,
    status: ProductStatus.Active,
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: 'PRD-1002',
    productCode: 'PRD-1002',
    barcode: '6900000001002',
    name: 'Thermal Receipt Printer',
    specification: '80 mm, USB and Ethernet',
    unit: 'pcs',
    unitPrice: 950,
    status: ProductStatus.Active,
    createdAt: '2024-02-20T08:00:00Z',
  },
  {
    id: 'PRD-1003',
    productCode: 'PRD-1003',
    barcode: '6900000001003',
    name: 'Label Roll',
    specification: '100 mm × 150 mm, 500 labels',
    unit: 'roll',
    unitPrice: 45,
    status: ProductStatus.Active,
    createdAt: '2024-03-12T08:00:00Z',
  },
  {
    id: 'PRD-1004',
    productCode: 'PRD-1004',
    barcode: '6900000001004',
    name: 'Legacy Scanner Cradle',
    specification: 'Model S100',
    unit: 'pcs',
    unitPrice: 120,
    status: ProductStatus.Inactive,
    createdAt: '2023-08-01T08:00:00Z',
  },
]

let salesOrders: SalesOrder[] = [
  {
    id: 'SO-1001',
    orderNo: 'SO-2026-0001',
    customerId: 'CUS-1001',
    customerName: 'Acme Corp',
    orderDate: '2026-09-20',
    status: SalesOrderStatus.Confirmed,
    totalAmount: 1360,
    lines: [
      {
        id: 'SOL-1001',
        productId: 'PRD-1001',
        productCode: 'PRD-1001',
        barcode: '6900000001001',
        productName: 'Wireless Barcode Scanner',
        specification: 'Model X200, Black',
        unit: 'pcs',
        unitPrice: 680,
        quantity: 2,
        amount: 1360,
      },
    ],
    createdAt: '2026-09-20T09:00:00Z',
  },
]

let salesOutbounds: SalesOutbound[] = []

let payments: Payment[] = []

let activities: CustomerActivity[] = [
  {
    id: 'ACT-1',
    customerId: 'CUS-1002',
    actor: 'Iris Chen',
    type: 'call',
    summary: 'Discovery call about automation workflow needs.',
    timestamp: '2024-11-20T16:00:00Z',
    statusAfter: CustomerStatus.InProgress,
  },
  {
    id: 'ACT-2',
    customerId: 'CUS-1001',
    actor: 'Jamie Lee',
    type: 'deal',
    summary: 'Renewed enterprise contract for another 12 months.',
    timestamp: '2024-11-10T09:00:00Z',
    statusAfter: CustomerStatus.Active,
  },
]

type SalesDataStore = {
  customers: Customer[]
  products: Product[]
  salesOrders: SalesOrder[]
  salesOutbounds: SalesOutbound[]
  payments: Payment[]
  activities: CustomerActivity[]
}

const salesDataStorageKey = 'sales-management-system-data'

const saveSalesData = () => {
  try {
    window.localStorage.setItem(salesDataStorageKey, JSON.stringify({
      customers,
      products,
      salesOrders,
      salesOutbounds,
      payments,
      activities,
    } satisfies SalesDataStore))
  } catch {
    // The application can continue with in-memory sample data if browser storage is unavailable.
  }
}

const restoreSalesData = () => {
  try {
    const storedData = window.localStorage.getItem(salesDataStorageKey)
    if (!storedData) return

    const data = JSON.parse(storedData) as Partial<SalesDataStore>
    if (Array.isArray(data.customers)) customers = data.customers
    if (Array.isArray(data.products)) products = data.products
    if (Array.isArray(data.salesOrders)) salesOrders = data.salesOrders
    if (Array.isArray(data.salesOutbounds)) salesOutbounds = data.salesOutbounds
    if (Array.isArray(data.payments)) payments = data.payments
    if (Array.isArray(data.activities)) activities = data.activities
  } catch {
    // Keep the bundled sample data when saved browser data cannot be read.
  }
}

restoreSalesData()

const roleSeeds: RoleDetail[] = [
  {
    id: 'ROL-1',
    name: 'Workspace Admin',
    description: 'Full access to billing, members, and security settings.',
    status: 'active',
    memberCount: 4,
    permissionCount: 18,
    updatedAt: '2024-11-24T10:00:00Z',
    owner: 'Jamie Lee',
    members: [
      { id: 'U-1', name: 'Jamie Lee', title: 'Head of Ops' },
      { id: 'U-2', name: 'Marco Díaz', title: 'Finance Lead' },
    ],
    permissions: [
      { id: 'perm-1', name: 'Manage Billing', category: 'Billing', description: 'Access invoices, payment settings, and coupons.', enabled: true },
      { id: 'perm-2', name: 'Invite Members', category: 'Members', description: 'Invite or remove workspace members.', enabled: true },
      { id: 'perm-3', name: 'Edit Roles', category: 'Access Control', description: 'Create or update custom roles.', enabled: true },
    ],
    auditLog: [
      { id: 'audit-1', actor: 'Jamie Lee', action: 'Updated permissions', timestamp: '2024-11-20T09:00:00Z' },
      { id: 'audit-2', actor: 'Marco Díaz', action: 'Removed member limit', timestamp: '2024-11-10T12:30:00Z' },
    ],
  },
  {
    id: 'ROL-2',
    name: 'Sales Manager',
    description: 'Manage pipeline, quotas, and team assignments.',
    status: 'active',
    memberCount: 8,
    permissionCount: 11,
    updatedAt: '2024-11-21T15:40:00Z',
    owner: 'Iris Chen',
    members: [
      { id: 'U-3', name: 'Iris Chen', title: 'Revenue Director' },
      { id: 'U-4', name: 'Alex Morgan', title: 'Regional Lead' },
    ],
    permissions: [
      { id: 'perm-4', name: 'View Revenue Dashboard', category: 'Analytics', description: 'Access team KPIs and forecasts.', enabled: true },
      { id: 'perm-5', name: 'Assign Leads', category: 'CRM', description: 'Assign or reassign leads.', enabled: true },
      { id: 'perm-6', name: 'Export Deals', category: 'CRM', description: 'Export pipeline data.', enabled: false },
    ],
    auditLog: [
      { id: 'audit-3', actor: 'Iris Chen', action: 'Granted export access to Alex Morgan', timestamp: '2024-11-05T08:20:00Z' },
    ],
  },
  {
    id: 'ROL-3',
    name: 'Support Agent',
    description: 'Limited access to ticketing and customer profiles.',
    status: 'pending',
    memberCount: 25,
    permissionCount: 6,
    updatedAt: '2024-11-18T07:15:00Z',
    owner: 'Nina Patel',
    members: [],
    permissions: [
      { id: 'perm-7', name: 'View Tickets', category: 'Support', description: 'Access assigned and team tickets.', enabled: true },
      { id: 'perm-8', name: 'Reply to Tickets', category: 'Support', description: 'Reply using shared inbox.', enabled: true },
      { id: 'perm-9', name: 'View Billing Data', category: 'Billing', description: 'Read-only access to invoices.', enabled: false },
    ],
    auditLog: [],
  },
]

let roles = [...roleSeeds]

const defaultPermissionTemplates: Array<Omit<Permission, 'id'>> = [
  {
    name: 'View Dashboard',
    category: 'Analytics',
    description: 'Read workspace health metrics and revenue charts.',
    enabled: true,
  },
  {
    name: 'View Customers',
    category: 'CRM',
    description: 'Read customer profiles, lifecycle status, and activity history.',
    enabled: true,
  },
  {
    name: 'Edit Customers',
    category: 'CRM',
    description: 'Create, edit, assign, and update customer records.',
    enabled: false,
  },
  {
    name: 'Invite Members',
    category: 'Members',
    description: 'Invite users and manage member access.',
    enabled: false,
  },
  {
    name: 'Edit Roles',
    category: 'Access Control',
    description: 'Create or update custom team roles.',
    enabled: false,
  },
]

const createDefaultPermissions = (): Permission[] =>
  defaultPermissionTemplates.map(permission => ({
    ...permission,
    id: `perm-${randomId()}`,
  }))

const toRoleSummary = (role: RoleDetail): Role => ({
  id: role.id,
  name: role.name,
  description: role.description,
  status: role.status,
  memberCount: role.memberCount,
  permissionCount: role.permissionCount,
  updatedAt: role.updatedAt,
  owner: role.owner,
})

export interface DashboardStats {
  outstandingCustomers: { name: string; amount: number }[]
  totalSales: number
  receivedAmount: number
  unpaidAmount: number
  outboundQuantity: number
  totalCustomers: number
  newCustomers: number
  monthlyRecurringRevenue: number
  activeDeals: number
  revenueTrend: { month: string; revenue: number }[]
  sourceDistribution: { type: string; value: number }[]
  recentActivities: CustomerActivity[]
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  await sleep()
  const now = new Date()
  const newCustomers = customers.filter(customer => {
    const created = new Date(customer.createdAt)
    return created.getUTCFullYear() === now.getUTCFullYear() && created.getUTCMonth() === now.getUTCMonth()
  })

  const revenueTrend = Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date()
    date.setUTCMonth(date.getUTCMonth() - (5 - idx))
    const monthLabel = date.toLocaleString('default', { month: 'short' })
    const revenue = customers.reduce((sum, customer) => {
      if (customer.monthlyRecurringRevenue) {
        return sum + customer.monthlyRecurringRevenue * (0.8 + Math.random() * 0.4)
      }
      return sum
    }, 0)
    return { month: monthLabel, revenue: Number(revenue.toFixed(0)) }
  })

  const sourceCounts = salesOrders.filter(order => order.status === SalesOrderStatus.Confirmed).reduce<Record<string, number>>((acc, order) => {
    const paid = payments.filter(payment => payment.salesOrderId === order.id && payment.status === PaymentStatus.Confirmed).reduce((total, payment) => total + payment.amount, 0)
    const status = paid === 0 ? 'Unpaid' : paid >= order.totalAmount ? 'Paid' : 'Partially Paid'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})
  const totalSales = salesOrders.filter(order => order.status === SalesOrderStatus.Confirmed).reduce((total, order) => total + order.totalAmount, 0)
  const receivedAmount = payments.filter(payment => payment.status === PaymentStatus.Confirmed).reduce((total, payment) => total + payment.amount, 0)
  const outboundQuantity = salesOutbounds.filter(outbound => outbound.status === SalesOutboundStatus.Confirmed).flatMap(outbound => outbound.lines).reduce((total, line) => total + line.outboundQuantity, 0)
  const outstandingCustomers = salesOrders.filter(order => order.status === SalesOrderStatus.Confirmed).reduce<Record<string, number>>((result, order) => {
    const paid = payments.filter(payment => payment.salesOrderId === order.id && payment.status === PaymentStatus.Confirmed).reduce((total, payment) => total + payment.amount, 0)
    result[order.customerName] = (result[order.customerName] ?? 0) + Math.max(0, order.totalAmount - paid)
    return result
  }, {})

  return {
    totalSales,
    receivedAmount,
    unpaidAmount: Math.max(0, totalSales - receivedAmount),
    outboundQuantity,
    outstandingCustomers: Object.entries(outstandingCustomers).filter(([, amount]) => amount > 0).map(([name, amount]) => ({ name, amount })).sort((left, right) => right.amount - left.amount),
    totalCustomers: customers.length,
    newCustomers: newCustomers.length,
    monthlyRecurringRevenue: customers.reduce((sum, customer) => sum + (customer.monthlyRecurringRevenue ?? 0), 0),
    activeDeals: customers.filter(customer => customer.status === CustomerStatus.InProgress).length,
    revenueTrend,
    sourceDistribution: Object.entries(sourceCounts).map(([type, value]) => ({ type, value })),
    recentActivities: salesOrders.slice(0, 5).map(order => ({
      id: order.id,
      customerId: order.customerId,
      actor: order.customerName,
      type: 'deal' as const,
      summary: `${order.orderNo} · ¥${order.totalAmount.toLocaleString()} · ${order.status}`,
      timestamp: order.createdAt,
    })),
  }
}

export const getCustomers = async (): Promise<Customer[]> => {
  await sleep()
  return customers
}

export const getCustomer = async (id: string): Promise<Customer | undefined> => {
  await sleep()
  return customers.find(customer => customer.id === id)
}

export const createCustomer = async (payload: CustomerFormValues): Promise<Customer> => {
  await sleep()
  const newCustomer: Customer = {
    id: `CUS-${randomId()}`,
    createdAt: new Date().toISOString(),
    source: CustomerSource.Other,
    ...payload,
  }
  customers = [newCustomer, ...customers]
  activities = [
    createActivity(newCustomer.id, 'Created a new customer record', {
      actor: 'System',
      statusAfter: payload.status,
    }),
    ...activities,
  ]
  saveSalesData()
  return newCustomer
}

export const updateCustomer = async (id: string, payload: Partial<CustomerFormValues>): Promise<Customer> => {
  await sleep()
  const index = customers.findIndex(customer => customer.id === id)
  if (index === -1) {
    throw new Error('Customer not found')
  }
  const existing = customers[index]
  const updated: Customer = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  }
  customers[index] = updated
  if (payload.status && payload.status !== existing.status) {
    activities = [
      createActivity(updated.id, `Status updated from ${existing.status} to ${payload.status}`, {
        actor: 'System',
        type: 'deal',
        statusAfter: payload.status,
      }),
      ...activities,
    ]
  }
  saveSalesData()
  return updated
}

export const bulkUpdateCustomerStatus = async (ids: string[], status: CustomerStatus): Promise<Customer[]> => {
  await sleep()
  const idSet = new Set(ids)
  const updatedCustomers: Customer[] = []
  const nextActivities: CustomerActivity[] = []

  customers = customers.map(customer => {
    if (!idSet.has(customer.id)) return customer

    const updated: Customer = {
      ...customer,
      status,
      updatedAt: new Date().toISOString(),
    }
    updatedCustomers.push(updated)

    if (customer.status !== status) {
      nextActivities.push(createActivity(customer.id, `Bulk status update from ${customer.status} to ${status}`, {
        actor: customer.owner ?? 'Bulk action',
        type: 'deal',
        statusAfter: status,
      }))
    }

    return updated
  })

  if (updatedCustomers.length === 0) {
    throw new Error('No customers found')
  }

  activities = [...nextActivities, ...activities]
  saveSalesData()
  return updatedCustomers
}

export const bulkAssignCustomerOwner = async (ids: string[], owner: string): Promise<Customer[]> => {
  await sleep()
  const idSet = new Set(ids)
  const updatedCustomers: Customer[] = []

  customers = customers.map(customer => {
    if (!idSet.has(customer.id)) return customer

    const updated: Customer = {
      ...customer,
      owner,
      updatedAt: new Date().toISOString(),
    }
    updatedCustomers.push(updated)
    return updated
  })

  if (updatedCustomers.length === 0) {
    throw new Error('No customers found')
  }

  activities = [
    ...updatedCustomers.map(customer =>
      createActivity(customer.id, `Assigned owner to ${owner}`, {
        actor: owner,
        type: 'note',
        statusAfter: customer.status,
      }),
    ),
    ...activities,
  ]
  saveSalesData()
  return updatedCustomers
}

export const bulkDeleteCustomers = async (ids: string[]): Promise<void> => {
  await sleep()
  const idSet = new Set(ids)
  customers = customers.filter(customer => !idSet.has(customer.id))
  activities = activities.filter(activity => !idSet.has(activity.customerId))
  saveSalesData()
}

export const deleteCustomer = async (id: string): Promise<void> => {
  await sleep()
  customers = customers.filter(customer => customer.id !== id)
  activities = activities.filter(activity => activity.customerId !== id)
  saveSalesData()
}

export const getProducts = async (): Promise<Product[]> => {
  await sleep()
  return products
}

export const createProduct = async (payload: ProductFormValues): Promise<Product> => {
  await sleep()
  const product: Product = {
    id: `PRD-${randomId()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  }
  products = [product, ...products]
  saveSalesData()
  return product
}

export const updateProduct = async (id: string, payload: ProductFormValues): Promise<Product> => {
  await sleep()
  const existing = products.find(product => product.id === id)
  if (!existing) {
    throw new Error('Product not found')
  }

  const updated: Product = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  }
  products = products.map(product => product.id === id ? updated : product)
  saveSalesData()
  return updated
}

export const deleteProduct = async (id: string): Promise<void> => {
  await sleep()
  products = products.filter(product => product.id !== id)
  saveSalesData()
}

export const getProductByCodeOrBarcode = async (value: string): Promise<Product | undefined> => {
  await sleep(120)
  const normalized = value.trim().toLowerCase()
  return products.find(product =>
    product.status === ProductStatus.Active &&
    (product.productCode.toLowerCase() === normalized || product.barcode?.toLowerCase() === normalized),
  )
}

export const getSalesOrders = async (): Promise<SalesOrder[]> => {
  await sleep()
  return salesOrders
}

export const createSalesOrder = async (payload: SalesOrderFormValues): Promise<SalesOrder> => {
  await sleep()
  const customer = customers.find(entry => entry.id === payload.customerId)
  if (!customer) {
    throw new Error('Customer not found')
  }

  const order: SalesOrder = {
    id: `SO-${randomId()}`,
    orderNo: `SO-${new Date().getFullYear()}-${String(salesOrders.length + 1).padStart(4, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    orderDate: payload.orderDate,
    status: SalesOrderStatus.Draft,
    totalAmount: payload.lines.reduce((total, line) => total + line.amount, 0),
    lines: payload.lines,
    createdAt: new Date().toISOString(),
  }
  salesOrders = [order, ...salesOrders]
  saveSalesData()
  return order
}

export const updateSalesOrder = async (id: string, payload: SalesOrderFormValues): Promise<SalesOrder> => {
  await sleep()
  const existing = salesOrders.find(order => order.id === id)
  const customer = customers.find(entry => entry.id === payload.customerId)
  if (!existing || !customer) {
    throw new Error('Sales order or customer not found')
  }
  if (existing.status !== SalesOrderStatus.Draft) {
    throw new Error('Only draft sales orders can be edited')
  }

  const updated: SalesOrder = {
    ...existing,
    customerId: customer.id,
    customerName: customer.name,
    orderDate: payload.orderDate,
    lines: payload.lines,
    totalAmount: payload.lines.reduce((total, line) => total + line.amount, 0),
  }
  salesOrders = salesOrders.map(order => order.id === id ? updated : order)
  saveSalesData()
  return updated
}

export const confirmSalesOrder = async (id: string): Promise<SalesOrder> => {
  await sleep()
  const existing = salesOrders.find(order => order.id === id)
  if (!existing) {
    throw new Error('Sales order not found')
  }
  if (existing.status !== SalesOrderStatus.Draft) {
    throw new Error('Only draft sales orders can be confirmed')
  }

  const confirmed = { ...existing, status: SalesOrderStatus.Confirmed }
  salesOrders = salesOrders.map(order => order.id === id ? confirmed : order)
  saveSalesData()
  return confirmed
}

export const cancelSalesOrderConfirmation = async (id: string): Promise<SalesOrder> => {
  await sleep()
  const existing = salesOrders.find(order => order.id === id)
  if (!existing) {
    throw new Error('Sales order not found')
  }
  if (existing.status !== SalesOrderStatus.Confirmed) {
    throw new Error('Only confirmed sales orders can have confirmation cancelled')
  }

  const draft = { ...existing, status: SalesOrderStatus.Draft }
  salesOrders = salesOrders.map(order => order.id === id ? draft : order)
  saveSalesData()
  return draft
}

export const deleteSalesOrder = async (id: string): Promise<void> => {
  await sleep()
  const existing = salesOrders.find(order => order.id === id)
  if (!existing) {
    throw new Error('Sales order not found')
  }
  if (existing.status !== SalesOrderStatus.Draft) {
    throw new Error('Only draft sales orders can be deleted')
  }
  salesOrders = salesOrders.filter(order => order.id !== id)
  saveSalesData()
}

const outboundLinesForOrder = (order: SalesOrder): SalesOutboundLine[] => order.lines.map(line => {
  const confirmedQuantity = salesOutbounds
    .filter(outbound => outbound.salesOrderId === order.id && outbound.status === SalesOutboundStatus.Confirmed)
    .flatMap(outbound => outbound.lines)
    .filter(outboundLine => outboundLine.salesOrderLineId === line.id)
    .reduce((total, outboundLine) => total + outboundLine.outboundQuantity, 0)
  const remainingQuantity = Math.max(0, line.quantity - confirmedQuantity)
  return {
    id: `OUT-${line.id}`,
    salesOrderLineId: line.id,
    productCode: line.productCode,
    productName: line.productName,
    unit: line.unit,
    orderedQuantity: line.quantity,
    remainingQuantity,
    outboundQuantity: remainingQuantity,
  }
})

export const getAvailableSalesOrdersForOutbound = async (): Promise<SalesOrder[]> => {
  await sleep()
  return salesOrders.filter(order =>
    order.status === SalesOrderStatus.Confirmed && outboundLinesForOrder(order).some(line => line.remainingQuantity > 0),
  )
}

export const getOutboundLinesForOrder = async (orderId: string): Promise<SalesOutboundLine[]> => {
  await sleep()
  const order = salesOrders.find(entry => entry.id === orderId)
  if (!order || order.status !== SalesOrderStatus.Confirmed) {
    throw new Error('Confirmed sales order not found')
  }
  return outboundLinesForOrder(order).filter(line => line.remainingQuantity > 0)
}

export const getSalesOutbounds = async (): Promise<SalesOutbound[]> => {
  await sleep()
  return salesOutbounds
}

export const createSalesOutbound = async (payload: SalesOutboundFormValues): Promise<SalesOutbound> => {
  await sleep()
  const order = salesOrders.find(entry => entry.id === payload.salesOrderId)
  if (!order || order.status !== SalesOrderStatus.Confirmed) {
    throw new Error('Confirmed sales order not found')
  }
  const lines = payload.lines.filter(line => line.outboundQuantity > 0)
  if (lines.length === 0) {
    throw new Error('Enter at least one outbound quantity')
  }
  const outbound: SalesOutbound = {
    id: `OUT-${randomId()}`,
    outboundNo: `OUT-${new Date().getFullYear()}-${String(salesOutbounds.length + 1).padStart(4, '0')}`,
    salesOrderId: order.id,
    orderNo: order.orderNo,
    customerName: order.customerName,
    outboundDate: payload.outboundDate,
    status: SalesOutboundStatus.Draft,
    lines,
    createdAt: new Date().toISOString(),
  }
  salesOutbounds = [outbound, ...salesOutbounds]
  saveSalesData()
  return outbound
}

export const updateSalesOutbound = async (id: string, payload: SalesOutboundFormValues): Promise<SalesOutbound> => {
  await sleep()
  const existing = salesOutbounds.find(entry => entry.id === id)
  const order = salesOrders.find(entry => entry.id === payload.salesOrderId)
  if (!existing || !order || existing.status !== SalesOutboundStatus.Draft || existing.salesOrderId !== order.id) {
    throw new Error('Draft sales outbound not found')
  }
  const available = outboundLinesForOrder(order)
  const lines = payload.lines.filter(line => line.outboundQuantity > 0)
  if (lines.length === 0 || lines.some(line => line.outboundQuantity > (available.find(item => item.salesOrderLineId === line.salesOrderLineId)?.remainingQuantity ?? 0))) {
    throw new Error('Outbound quantity exceeds the remaining order quantity')
  }
  const updated = { ...existing, outboundDate: payload.outboundDate, lines }
  salesOutbounds = salesOutbounds.map(entry => entry.id === id ? updated : entry)
  saveSalesData()
  return updated
}

export const confirmSalesOutbound = async (id: string): Promise<SalesOutbound> => {
  await sleep()
  const outbound = salesOutbounds.find(entry => entry.id === id)
  const order = outbound && salesOrders.find(entry => entry.id === outbound.salesOrderId)
  if (!outbound || !order || outbound.status !== SalesOutboundStatus.Draft) {
    throw new Error('Draft sales outbound not found')
  }
  const available = outboundLinesForOrder(order)
  if (outbound.lines.some(line => line.outboundQuantity > (available.find(item => item.salesOrderLineId === line.salesOrderLineId)?.remainingQuantity ?? 0))) {
    throw new Error('Outbound quantity exceeds the remaining order quantity')
  }
  const confirmed = { ...outbound, status: SalesOutboundStatus.Confirmed }
  salesOutbounds = salesOutbounds.map(entry => entry.id === id ? confirmed : entry)
  saveSalesData()
  return confirmed
}

export const cancelSalesOutboundConfirmation = async (id: string): Promise<SalesOutbound> => {
  await sleep()
  const outbound = salesOutbounds.find(entry => entry.id === id)
  if (!outbound || outbound.status !== SalesOutboundStatus.Confirmed) {
    throw new Error('Confirmed sales outbound not found')
  }
  const draft = { ...outbound, status: SalesOutboundStatus.Draft }
  salesOutbounds = salesOutbounds.map(entry => entry.id === id ? draft : entry)
  saveSalesData()
  return draft
}

export const deleteSalesOutbound = async (id: string): Promise<void> => {
  await sleep()
  const outbound = salesOutbounds.find(entry => entry.id === id)
  if (!outbound || outbound.status !== SalesOutboundStatus.Draft) {
    throw new Error('Only draft sales outbounds can be deleted')
  }
  salesOutbounds = salesOutbounds.filter(entry => entry.id !== id)
  saveSalesData()
}

const paymentSummaryForOrder = (order: SalesOrder): PaymentOrderSummary => {
  const paidAmount = payments
    .filter(payment => payment.salesOrderId === order.id && payment.status === PaymentStatus.Confirmed)
    .reduce((total, payment) => total + payment.amount, 0)
  return {
    id: order.id,
    orderNo: order.orderNo,
    customerName: order.customerName,
    orderAmount: order.totalAmount,
    paidAmount,
    unpaidAmount: Math.max(0, order.totalAmount - paidAmount),
  }
}

export const getPaymentOrderSummaries = async (): Promise<PaymentOrderSummary[]> => {
  await sleep()
  return salesOrders
    .filter(order => order.status === SalesOrderStatus.Confirmed)
    .map(paymentSummaryForOrder)
    .filter(summary => summary.unpaidAmount > 0)
}

export const getPayments = async (): Promise<Payment[]> => {
  await sleep()
  return payments
}

export const createPayment = async (payload: PaymentFormValues): Promise<Payment> => {
  await sleep()
  const order = salesOrders.find(entry => entry.id === payload.salesOrderId)
  if (!order || order.status !== SalesOrderStatus.Confirmed) {
    throw new Error('Confirmed sales order not found')
  }
  const summary = paymentSummaryForOrder(order)
  if (payload.amount <= 0 || payload.amount > summary.unpaidAmount) {
    throw new Error('Payment amount exceeds the unpaid amount')
  }
  const payment: Payment = {
    id: `PAY-${randomId()}`,
    paymentNo: `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`,
    salesOrderId: order.id,
    orderNo: order.orderNo,
    customerName: order.customerName,
    paymentDate: payload.paymentDate,
    amount: payload.amount,
    method: payload.method,
    referenceNo: payload.referenceNo,
    status: PaymentStatus.Draft,
    createdAt: new Date().toISOString(),
  }
  payments = [payment, ...payments]
  saveSalesData()
  return payment
}

export const updatePayment = async (id: string, payload: PaymentFormValues): Promise<Payment> => {
  await sleep()
  const existing = payments.find(entry => entry.id === id)
  const order = salesOrders.find(entry => entry.id === payload.salesOrderId)
  if (!existing || !order || existing.status !== PaymentStatus.Draft || existing.salesOrderId !== order.id) {
    throw new Error('Draft payment not found')
  }
  if (payload.amount <= 0 || payload.amount > paymentSummaryForOrder(order).unpaidAmount) {
    throw new Error('Payment amount exceeds the unpaid amount')
  }
  const updated = { ...existing, paymentDate: payload.paymentDate, amount: payload.amount, method: payload.method, referenceNo: payload.referenceNo }
  payments = payments.map(entry => entry.id === id ? updated : entry)
  saveSalesData()
  return updated
}

export const confirmPayment = async (id: string): Promise<Payment> => {
  await sleep()
  const payment = payments.find(entry => entry.id === id)
  const order = payment && salesOrders.find(entry => entry.id === payment.salesOrderId)
  if (!payment || !order || payment.status !== PaymentStatus.Draft) {
    throw new Error('Draft payment not found')
  }
  if (payment.amount > paymentSummaryForOrder(order).unpaidAmount) {
    throw new Error('Payment amount exceeds the unpaid amount')
  }
  const confirmed = { ...payment, status: PaymentStatus.Confirmed }
  payments = payments.map(entry => entry.id === id ? confirmed : entry)
  saveSalesData()
  return confirmed
}

export const cancelPaymentConfirmation = async (id: string): Promise<Payment> => {
  await sleep()
  const payment = payments.find(entry => entry.id === id)
  if (!payment || payment.status !== PaymentStatus.Confirmed) {
    throw new Error('Confirmed payment not found')
  }
  const draft = { ...payment, status: PaymentStatus.Draft }
  payments = payments.map(entry => entry.id === id ? draft : entry)
  saveSalesData()
  return draft
}

export const deletePayment = async (id: string): Promise<void> => {
  await sleep()
  const payment = payments.find(entry => entry.id === id)
  if (!payment || payment.status !== PaymentStatus.Draft) {
    throw new Error('Only draft payments can be deleted')
  }
  payments = payments.filter(entry => entry.id !== id)
  saveSalesData()
}

export const getSalesOrderExecution = async (orderId: string): Promise<{ outbounds: SalesOutbound[]; payments: Payment[] }> => {
  await sleep()
  return {
    outbounds: salesOutbounds.filter(outbound => outbound.salesOrderId === orderId),
    payments: payments.filter(payment => payment.salesOrderId === orderId),
  }
}

export const getSalesOrderPaymentReport = async (): Promise<SalesOrderPaymentReportRow[]> => {
  await sleep()
  return salesOrders
    .filter(order => order.status === SalesOrderStatus.Confirmed)
    .map(order => {
      const confirmedPayments = payments
        .filter(payment => payment.salesOrderId === order.id && payment.status === PaymentStatus.Confirmed)
        .sort((left, right) => right.paymentDate.localeCompare(left.paymentDate))
      const paidAmount = confirmedPayments.reduce((total, payment) => total + payment.amount, 0)
      const unpaidAmount = Math.max(0, order.totalAmount - paidAmount)
      return {
        id: order.id,
        orderNo: order.orderNo,
        customerName: order.customerName,
        orderDate: order.orderDate,
        orderAmount: order.totalAmount,
        paidAmount,
        unpaidAmount,
        lastPaymentDate: confirmedPayments[0]?.paymentDate,
        paymentStatus: paidAmount === 0
          ? SalesOrderPaymentStatus.Unpaid
          : unpaidAmount === 0
            ? SalesOrderPaymentStatus.Paid
            : SalesOrderPaymentStatus.PartiallyPaid,
      }
    })
}

export const getCustomerActivities = async (customerId: string): Promise<CustomerActivity[]> => {
  await sleep()
  return activities.filter(activity => activity.customerId === customerId)
}

export const getRoles = async (): Promise<Role[]> => {
  await sleep()
  return roles.map(toRoleSummary)
}

export const getRoleDetail = async (roleId: string): Promise<RoleDetail | undefined> => {
  await sleep()
  return roles.find(role => role.id === roleId)
}

export const createRole = async (payload: RoleFormValues): Promise<RoleDetail> => {
  await sleep()
  const permissions = createDefaultPermissions()
  const now = new Date().toISOString()
  const role: RoleDetail = {
    id: `ROL-${randomId()}`,
    ...payload,
    memberCount: 0,
    permissionCount: permissions.filter(permission => permission.enabled).length,
    updatedAt: now,
    members: [],
    permissions,
    auditLog: [
      {
        id: `audit-${randomId()}`,
        actor: payload.owner,
        action: 'Created role',
        timestamp: now,
      },
    ],
  }

  roles = [role, ...roles]
  return role
}

export const updateRole = async (roleId: string, payload: RoleFormValues): Promise<RoleDetail> => {
  await sleep()
  const role = roles.find(roleEntry => roleEntry.id === roleId)
  if (!role) {
    throw new Error('Role not found')
  }

  const now = new Date().toISOString()
  const updated: RoleDetail = {
    ...role,
    ...payload,
    updatedAt: now,
    auditLog: [
      {
        id: `audit-${randomId()}`,
        actor: payload.owner,
        action: 'Updated role details',
        timestamp: now,
      },
      ...role.auditLog,
    ],
  }

  roles = roles.map(roleEntry => (roleEntry.id === roleId ? updated : roleEntry))
  return updated
}

export const updateRolePermissions = async (roleId: string, permissions: Permission[]): Promise<RoleDetail> => {
  await sleep()
  const role = roles.find(roleEntry => roleEntry.id === roleId)
  if (!role) {
    throw new Error('Role not found')
  }
  role.permissions = permissions
  role.permissionCount = permissions.filter(permission => permission.enabled).length
  role.updatedAt = new Date().toISOString()
  roles = roles.map(roleEntry => (roleEntry.id === roleId ? role : roleEntry))
  return role
}
