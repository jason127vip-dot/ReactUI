import { useEffect, useState } from 'react'
import { Alert, Button, Card, Empty, Popconfirm, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  cancelSalesOutboundConfirmation,
  confirmSalesOutbound,
  createSalesOutbound,
  deleteSalesOutbound,
  getSalesOutbounds,
  updateSalesOutbound,
} from '../../utils/mockData'
import SalesOutboundForm from './components/SalesOutboundForm'
import { SalesOutbound, SalesOutboundStatus } from './types'

const statusColorMap: Record<SalesOutboundStatus, string> = {
  [SalesOutboundStatus.Draft]: 'default',
  [SalesOutboundStatus.Confirmed]: 'processing',
}

const SalesOutboundPage = () => {
  const [outbounds, setOutbounds] = useState<SalesOutbound[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [formVisible, setFormVisible] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingOutbound, setEditingOutbound] = useState<SalesOutbound>()

  const loadOutbounds = async () => {
    setLoading(true)
    setError(undefined)
    try {
      setOutbounds(await getSalesOutbounds())
    } catch (loadError) {
      console.error(loadError)
      setError('Failed to load sales outbounds. Check the data source and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOutbounds()
  }, [])

  const openCreateForm = () => {
    setFormMode('create')
    setEditingOutbound(undefined)
    setFormVisible(true)
  }

  const confirm = async (outbound: SalesOutbound) => {
    try {
      await confirmSalesOutbound(outbound.id)
      message.success(`${outbound.outboundNo} confirmed`)
      await loadOutbounds()
    } catch (confirmError) {
      console.error(confirmError)
      message.error('Unable to confirm this sales outbound. The remaining quantity may have changed.')
    }
  }

  const remove = async (outbound: SalesOutbound) => {
    try {
      await deleteSalesOutbound(outbound.id)
      message.success(`${outbound.outboundNo} deleted`)
      await loadOutbounds()
    } catch (deleteError) {
      console.error(deleteError)
      message.error('Failed to delete sales outbound.')
    }
  }

  const cancelConfirmation = async (outbound: SalesOutbound) => {
    try {
      await cancelSalesOutboundConfirmation(outbound.id)
      message.success(`${outbound.outboundNo} restored to draft`)
      await loadOutbounds()
    } catch (cancelError) {
      console.error(cancelError)
      message.error('Failed to cancel sales outbound confirmation.')
    }
  }

  const columns: ColumnsType<SalesOutbound> = [
    { title: 'Outbound No.', dataIndex: 'outboundNo' },
    { title: 'Sales Order', dataIndex: 'orderNo' },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Outbound Date', dataIndex: 'outboundDate' },
    { title: 'Items', render: (_value, outbound) => outbound.lines.reduce((total, line) => total + line.outboundQuantity, 0) },
    { title: 'Status', dataIndex: 'status', render: (status: SalesOutboundStatus) => <Tag color={statusColorMap[status]}>{status}</Tag> },
    {
      title: 'Actions',
      render: (_value, outbound) => (
        <Space>
          {outbound.status === SalesOutboundStatus.Draft && (
            <>
              <Popconfirm title="Confirm this sales outbound?" description="Confirmed quantities will reduce the remaining order quantity." okText="Confirm outbound" cancelText="Cancel" onConfirm={() => confirm(outbound)}>
                <Button type="link">Confirm</Button>
              </Popconfirm>
              <Button type="link" onClick={() => {
                setFormMode('edit')
                setEditingOutbound(outbound)
                setFormVisible(true)
              }}>
                Edit
              </Button>
              <Popconfirm title="Delete this sales outbound?" okText="Delete outbound" cancelText="Cancel" okButtonProps={{ danger: true }} onConfirm={() => remove(outbound)}>
                <Button type="link" danger>Delete</Button>
              </Popconfirm>
            </>
          )}
          {outbound.status === SalesOutboundStatus.Confirmed && (
            <Popconfirm title="Cancel outbound confirmation?" description="The outbound will return to Draft and its quantity will be released." okText="Cancel confirmation" cancelText="Keep confirmed" onConfirm={() => cancelConfirmation(outbound)}>
              <Button type="link">Cancel Confirmation</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Sales Outbound" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Sales Outbound</Button>}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {error && <Alert type="error" showIcon message={error} action={<Button size="small" icon={<ReloadOutlined />} onClick={loadOutbounds}>Retry</Button>} />}
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={outbounds}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{ emptyText: <Empty description="No sales outbounds found." /> }}
          />
        </Space>
      </Card>
      <SalesOutboundForm
        mode={formMode}
        open={formVisible}
        initialOutbound={editingOutbound}
        onCancel={() => {
          setFormVisible(false)
          setEditingOutbound(undefined)
        }}
        onSubmit={async values => {
          try {
            if (formMode === 'create') {
              await createSalesOutbound(values)
              message.success('Sales outbound created successfully')
            } else if (editingOutbound) {
              await updateSalesOutbound(editingOutbound.id, values)
              message.success('Sales outbound updated')
            }
            setFormVisible(false)
            setEditingOutbound(undefined)
            await loadOutbounds()
          } catch (saveError) {
            console.error(saveError)
            message.error('Failed to create sales outbound.')
          }
        }}
      />
    </Space>
  )
}

export default SalesOutboundPage
