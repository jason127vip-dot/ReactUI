import { useEffect, useState } from 'react'
import { Alert, Button, Card, Empty, Popconfirm, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  cancelSalesOrderConfirmation,
  confirmSalesOrder,
  createSalesOrder,
  deleteSalesOrder,
  getSalesOrders,
  updateSalesOrder,
} from '../../utils/mockData'
import SalesOrderDetail from './components/SalesOrderDetail'
import SalesOrderExecution from './components/SalesOrderExecution'
import SalesOrderForm from './components/SalesOrderForm'
import { SalesOrder, SalesOrderStatus } from './types'

const statusColorMap: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.Draft]: 'default',
  [SalesOrderStatus.Confirmed]: 'processing',
}

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
      message.error('Failed to cancel sales order confirmation.')
    }
  }

  const columns: ColumnsType<SalesOrder> = [
    { title: 'Order No.', dataIndex: 'orderNo' },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Order Date', dataIndex: 'orderDate' },
    { title: 'Total Amount', dataIndex: 'totalAmount', render: value => `¥${value.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', render: (status: SalesOrderStatus) => <Tag color={statusColorMap[status]}>{status}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_value, order) => (
        <Space>
          <Button type="link" onClick={() => {
            setSelectedOrder(order)
            setDetailVisible(true)
          }}>
            View
          </Button>
          {order.status === SalesOrderStatus.Draft && (
            <>
              <Button type="link" onClick={() => {
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
                <Button type="link">Confirm</Button>
              </Popconfirm>
              <Popconfirm
                title="Delete this sales order?"
                description="This action cannot be undone."
                okText="Delete order"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(order)}
              >
                <Button type="link" danger>Delete</Button>
              </Popconfirm>
            </>
          )}
          {order.status === SalesOrderStatus.Confirmed && (
            <>
              <Button type="link" onClick={() => { setSelectedOrder(order); setExecutionVisible(true) }}>Execution</Button>
              <Popconfirm
                title="Cancel order confirmation?"
                description="The order will return to Draft and can be edited again."
                okText="Cancel confirmation"
                cancelText="Keep confirmed"
                onConfirm={() => handleCancelConfirmation(order)}
              >
                <Button type="link">Cancel Confirmation</Button>
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
            dataSource={orders}
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
