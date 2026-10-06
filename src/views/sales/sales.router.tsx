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
const BranchesPage = lazy(() => import('../branches'))
const CreditControlPage = lazy(() => import('../credit-control'))
const PriceListsPage = lazy(() => import('../price-lists'))
const ProductsPage = lazy(() => import('../products'))
const SalesOrdersPage = lazy(() => import('../sales-orders'))
const SalesOutboundPage = lazy(() => import('../sales-outbound'))
const SalesInvoicesPage = lazy(() => import('../sales-invoices'))
const PaymentsPage = lazy(() => import('../payments'))
const SalesOrderPaymentReportPage = lazy(() => import('../sales-order-payment-report'))
const ARAgingReportPage = lazy(() => import('../ar-aging-report'))
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
        path: 'sales-invoices',
        element: <LazyRoute><SalesInvoicesPage /></LazyRoute>,
        meta: { label: 'Sales Invoice', title: 'Sales Invoice', key: '/sales/sales-invoices', icon: <FileTextOutlined /> },
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
        path: 'branches',
        element: <LazyRoute><BranchesPage /></LazyRoute>,
        meta: { label: 'Branches', title: 'Branches', key: '/master-data/branches' },
      },
      {
        path: 'credit-control',
        element: <LazyRoute><CreditControlPage /></LazyRoute>,
        meta: { label: 'Credit Control', title: 'Credit Control', key: '/master-data/credit-control' },
      },
      {
        path: 'price-lists',
        element: <LazyRoute><PriceListsPage /></LazyRoute>,
        meta: { label: 'Sales Price Lists', title: 'Sales Price Lists', key: '/master-data/price-lists' },
      },
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
        path: 'ar-aging',
        element: <LazyRoute><ARAgingReportPage /></LazyRoute>,
        meta: { label: 'AR Aging Report', title: 'AR Aging Report', key: '/reports/ar-aging' },
      },
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
