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
const ProductsPage = lazy(() => import('../products'))
const SalesOrdersPage = lazy(() => import('../sales-orders'))
const SalesOutboundPage = lazy(() => import('../sales-outbound'))
const PaymentsPage = lazy(() => import('../payments'))
const SalesOrderPaymentReportPage = lazy(() => import('../sales-order-payment-report'))
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
        element: (
          <LazyRoute>
            <SalesOrdersPage />
          </LazyRoute>
        ),
        meta: {
          label: 'Sales Orders',
          title: 'Sales Orders',
          key: '/sales/sales-orders',
          icon: <FileTextOutlined />,
        },
      },
      {
        path: 'deliveries',
        element: (
          <LazyRoute>
            <SalesOutboundPage />
          </LazyRoute>
        ),
        meta: {
          label: 'Sales Outbound',
          title: 'Sales Outbound',
          key: '/sales/deliveries',
          icon: <InboxOutlined />,
        },
      },
      {
        path: 'payments',
        element: (
          <LazyRoute>
            <PaymentsPage />
          </LazyRoute>
        ),
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
        element: (
          <LazyRoute>
            <ProductsPage />
          </LazyRoute>
        ),
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
        path: 'sales-order-payment-report',
        element: (
          <LazyRoute>
            <SalesOrderPaymentReportPage />
          </LazyRoute>
        ),
        meta: {
          label: 'Sales Order Payment Report',
          title: 'Sales Order Payment Report',
          key: '/reports/sales-order-payment-report',
        },
      },
    ],
  },
]

export default salesRoutes
