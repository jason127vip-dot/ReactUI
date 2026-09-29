import { lazy } from 'react'
import {
  BarChartOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
} from '@ant-design/icons'
import type { AdminRouterItem } from '../../router'
import LazyRoute from '../../components/common/LazyRoute'

const CustomersPage = lazy(() => import('../customers'))
const PlaceholderPage = lazy(() => import('.'))

const placeholder = (title: string) => (
  <LazyRoute>
    <PlaceholderPage title={title} />
  </LazyRoute>
)

const salesRoutes: AdminRouterItem[] = [
  {
    path: 'sales',
    meta: {
      label: 'Sales',
      title: 'Sales',
      key: '/sales',
      icon: <ShoppingCartOutlined />,
      order: 2,
    },
    children: [
      {
        path: 'sales-orders',
        element: placeholder('Sales Orders'),
        meta: {
          label: 'Sales Orders',
          title: 'Sales Orders',
          key: '/sales/sales-orders',
          icon: <FileTextOutlined />,
        },
      },
      {
        path: 'deliveries',
        element: placeholder('Deliveries'),
        meta: {
          label: 'Deliveries',
          title: 'Deliveries',
          key: '/sales/deliveries',
          icon: <InboxOutlined />,
        },
      },
      {
        path: 'payments',
        element: placeholder('Payments'),
        meta: {
          label: 'Payments',
          title: 'Payments',
          key: '/sales/payments',
          icon: <CreditCardOutlined />,
        },
      },
    ],
  },
  {
    path: 'master-data',
    meta: {
      label: 'Master Data',
      title: 'Master Data',
      key: '/master-data',
      icon: <TagsOutlined />,
      order: 3,
    },
    children: [
      {
        path: 'customers',
        element: (
          <LazyRoute>
            <CustomersPage />
          </LazyRoute>
        ),
        meta: {
          label: 'Customers',
          title: 'Customers',
          key: '/master-data/customers',
        },
      },
      {
        path: 'products',
        element: placeholder('Products'),
        meta: {
          label: 'Products',
          title: 'Products',
          key: '/master-data/products',
        },
      },
    ],
  },
  {
    path: 'reports',
    meta: {
      label: 'Reports',
      title: 'Reports',
      key: '/reports',
      icon: <BarChartOutlined />,
      order: 4,
    },
    children: [
      {
        path: 'outstanding-receivables',
        element: placeholder('Outstanding Receivables'),
        meta: {
          label: 'Outstanding Receivables',
          title: 'Outstanding Receivables',
          key: '/reports/outstanding-receivables',
        },
      },
    ],
  },
]

export default salesRoutes