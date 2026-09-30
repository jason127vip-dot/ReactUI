import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, DatePicker, Empty, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  cancelSalesOrderConfirmation,
  confirmSalesOrder,
  createSalesOrder,
  deleteSalesOrder,
  getSalesOrders,
  updateSalesOrder,
} from '../../services/salesOrderApi'
import SalesOrderDetail from './components/SalesOrderDetail'
import SalesOrderExecution from './components/SalesOrderExecution'
import SalesOrderForm from './components/SalesOrderForm'
import {
  SalesOrder,
  SalesOrderOutboundStatus,
  SalesOrderPaymentStatus,
  SalesOrderStatus,
} from './types'

const statusColorMap: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.Draft]: 'default',
  [SalesOrderStatus.Confirmed]: 'processing',
}

const outboundStatusOptions = {
  not_outbound: { label: 'Not Outbound', color: 'default' },
  partially_outbound: { label: 'Partially Outbound', color: 'warning' },
  fully_outbound: { label: 'Fully Outbound', color: 'success' },
} as const

const paymentStatusOptions = {
  unpaid: { label: 'Unpaid', color: 'default' },
  partially_paid: { label: 'Partially Paid', color: 'warning' },
  paid: { label: 'Paid', color: 'success' },
} as const

const SalesOrdersPage = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [formVisible, setFormVisible] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingOrder, setEditingOrder] = useState<SalesOrder>()
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder>()
  const [executionVisible, setExecutionVisible] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<SalesOrderStatus>()
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(undefined)
    try {
      setOrders(await getSalesOrders())
    } catch (loadError) {
      console.error(loadError)
      setError('Failed to load sales orders. Check the data source and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return orders.filter(order => {
      const matchesKeyword = !normalizedKeyword || [
        order.orderNo,
        order.customerName,
        order.customerPoNo,
        order.salesperson,
      ].some(value => value?.toLowerCase().includes(normalizedKeyword))
      const matchesStatus = !statusFilter || order.status === statusFilter
      const matchesStartDate = !dateRange?.[0] || order.orderDate >= dateRange[0].format('YYYY-MM-DD')
      const matchesEndDate = !dateRange?.[1] || order.orderDate <= dateRange[1].format('YYYY-MM-DD')
      return matchesKeyword && matchesStatus && matchesStartDate && matchesEndDate
    })
  }, [dateRange, keyword, orders, statusFilter])

  const openCreateForm = () => {
    setFormMode('create')
    setEditingOrder(undefined)
    setFormVisible(true)
  }

  const handleConfirm = async (order: SalesOrder) => {
    try {
      await confirmSalesOrder(order.id)
      message.success(`${order.orderNo} confirmed`)
      await loadOrders()
    } catch (confirmError) {
      console.error(confirmError)
      message.error('Failed to confirm sales order.')
    }
  }

  const handleDelete = async (order: SalesOrder) => {
    try {
      await deleteSalesOrder(order.id)
      message.success(`${order.orderNo} deleted`)
      await loadOrders()
    } catch (deleteError) {
      console.error(deleteError)
      message.error('Failed to delete sales order.')
    }
  }

  const handleCancelConfirmation = async (order: SalesOrder) => {
    try {
      await cancelSalesOrderConfirmation(order.id)
      message.success(`${order.orderNo} restored to draft`)
      await loadOrders()
    } catch (cancelError) {
      console.error(cancelError)
      message.error(cancelError && typeof cancelError === 'object' && 'message' in cancelError ? String(cancelError.message) : 'Failed to cancel sales order confirmation.')
    }
  }

  const columns: ColumnsType<SalesOrder> = [
    { title: 'Order No.', dataIndex: 'orderNo', width: 130 },
    { title: 'Customer', dataIndex: 'customerName', width: 125 },
    { title: 'Order Date', dataIndex: 'orderDate', width: 120 },
    { title: 'Total Qty', dataIndex: 'totalQuantity', width: 75, render: (value, order) => value ?? order.lines.reduce((sum, line) => sum + line.quantity, 0) },
    { title: 'Total Amount', dataIndex: 'totalAmount', width: 105, render: value => `$${value.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', width: 85, render: (status: SalesOrderStatus) => <Tag color={statusColorMap[status]}>{status}</Tag> },
    {
      title: 'Outbound',
      dataIndex: 'outboundStatus',
      width: 120,
      render: (status?: SalesOrderOutboundStatus) => {
        const option = outboundStatusOptions[status ?? 'not_outbound']
        return <Tag color={option.color}>{option.label}</Tag>
      },
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      width: 110,
      render: (status?: SalesOrderPaymentStatus) => {
        const option = paymentStatusOptions[status ?? 'unpaid']
        return <Tag color={option.color}>{option.label}</Tag>
      },
    },
    {
      title: 'Paid / Unpaid',
      width: 125,
      render: (_value, order) => (
        <Space direction="vertical" size={0}>
          <span>Paid: ${(order.paidAmount ?? 0).toLocaleString()}</span>
          <span>Unpaid: ${(order.unpaidAmount ?? order.totalAmount).toLocaleString()}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 255,
      render: (_value, order) => (
        <Space size={0}>
          <Button type="link" style={{ paddingInline: 8 }} onClick={() => {
            setSelectedOrder(order)
            setDetailVisible(true)
          }}>
            View
          </Button>
          {order.status === SalesOrderStatus.Draft && (
            <>
              <Button type="link" style={{ paddingInline: 8 }} onClick={() => {
                setFormMode('edit')
                setEditingOrder(order)
                setFormVisible(true)
              }}>
                Edit
              </Button>
              <Popconfirm
                title="Confirm this sales order?"
                description="Confirmed orders cannot be edited or deleted."
                okText="Confirm order"
                cancelText="Cancel"
                onConfirm={() => handleConfirm(order)}
              >
                <Button type="link" style={{ paddingInline: 8 }}>Confirm</Button>
              </Popconfirm>
              <Popconfirm
                title="Delete this sales order?"
                description="This action cannot be undone."
                okText="Delete order"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(order)}
              >
                <Button type="link" danger style={{ paddingInline: 8 }}>Delete</Button>
              </Popconfirm>
            </>
          )}
          {order.status === SalesOrderStatus.Confirmed && (
            <>
              <Button type="link" style={{ paddingInline: 8 }} onClick={() => { setSelectedOrder(order); setExecutionVisible(true) }}>Execution</Button>
              <Popconfirm
                title="Cancel order confirmation?"
                description="The order will return to Draft and can be edited again."
                okText="Cancel confirmation"
                cancelText="Keep confirmed"
                onConfirm={() => handleCancelConfirmation(order)}
              >
                <Button type="link" style={{ paddingInline: 8 }}>Cancel Confirmation</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title="Sales Orders"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Sales Order</Button>}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Order no., customer, PO no. or salesperson"
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              style={{ width: 340 }}
            />
            <Select
              allowClear
              placeholder="Confirmation status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              options={[
                { label: 'Draft', value: SalesOrderStatus.Draft },
                { label: 'Confirmed', value: SalesOrderStatus.Confirmed },
              ]}
            />
            <DatePicker.RangePicker value={dateRange} onChange={value => setDateRange(value)} />
            <Button onClick={() => {
              setKeyword('')
              setStatusFilter(undefined)
              setDateRange(null)
            }}>
              Reset
            </Button>
          </Space>
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              action={<Button size="small" icon={<ReloadOutlined />} onClick={loadOrders}>Retry</Button>}
            />
          )}
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filteredOrders}
            tableLayout="fixed"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{
              emptyText: (
                <Empty description="No sales orders found.">
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Sales Order</Button>
                </Empty>
              ),
            }}
          />
        </Space>
      </Card>

      <SalesOrderForm
        mode={formMode}
        open={formVisible}
        initialOrder={editingOrder}
        onCancel={() => {
          setFormVisible(false)
          setEditingOrder(undefined)
        }}
        onSubmit={async values => {
          try {
            if (formMode === 'create') {
              await createSalesOrder(values)
              message.success('Sales order created successfully')
            } else if (editingOrder) {
              await updateSalesOrder(editingOrder.id, values)
              message.success('Sales order updated')
            }
            setFormVisible(false)
            setEditingOrder(undefined)
            await loadOrders()
          } catch (saveError) {
            console.error(saveError)
            message.error('Failed to create sales order. Please try again later.')
          }
        }}
      />
      <SalesOrderDetail order={selectedOrder} open={detailVisible} onClose={() => setDetailVisible(false)} />
      <SalesOrderExecution order={selectedOrder} open={executionVisible} onClose={() => setExecutionVisible(false)} />
    </Space>
  )
}

export default SalesOrdersPage
