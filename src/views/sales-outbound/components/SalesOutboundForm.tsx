import { useEffect, useState } from 'react'
import { DatePicker, InputNumber, Modal, Select, Space, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { getAvailableSalesOrdersForOutbound, getOutboundLinesForOrder } from '../../../utils/mockData'
import { SalesOrder } from '../../sales-orders/types'
import { SalesOutbound, SalesOutboundLine } from '../types'

interface SalesOutboundFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialOutbound?: SalesOutbound
  onCancel: () => void
  onSubmit: (values: { salesOrderId: string; outboundDate: string; lines: SalesOutboundLine[] }) => Promise<void> | void
}

const SalesOutboundForm = ({ mode, open, initialOutbound, onCancel, onSubmit }: SalesOutboundFormProps) => {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [orderId, setOrderId] = useState<string>()
  const [outboundDate, setOutboundDate] = useState<Dayjs>(dayjs())
  const [lines, setLines] = useState<SalesOutboundLine[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    getAvailableSalesOrdersForOutbound().then(setOrders).catch(error => {
      console.error(error)
      message.error('Failed to load confirmed sales orders.')
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    if (!initialOutbound) {
      setOrderId(undefined)
      setLines([])
      setOutboundDate(dayjs())
      return
    }
    setOrderId(initialOutbound.salesOrderId)
    setOutboundDate(dayjs(initialOutbound.outboundDate))
    getOutboundLinesForOrder(initialOutbound.salesOrderId)
      .then(currentLines => setLines(currentLines.map(line => {
        const saved = initialOutbound.lines.find(item => item.salesOrderLineId === line.salesOrderLineId)
        return saved ? { ...line, outboundQuantity: Math.min(saved.outboundQuantity, line.remainingQuantity) } : line
      })))
      .catch(error => {
        console.error(error)
        message.error('Failed to load outbound items.')
      })
  }, [initialOutbound, open])

  const selectOrder = async (salesOrderId: string) => {
    setOrderId(salesOrderId)
    setLoading(true)
    try {
      setLines(await getOutboundLinesForOrder(salesOrderId))
    } catch (error) {
      console.error(error)
      message.error('Failed to load order items.')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (lineId: string, value: number | null) => {
    setLines(current => current.map(line => line.id === lineId
      ? { ...line, outboundQuantity: Math.min(Math.max(value ?? 0, 0), line.remainingQuantity) }
      : line,
    ))
  }

  const submit = async () => {
    if (!orderId) {
      message.warning('Select a confirmed sales order.')
      return
    }
    if (!lines.some(line => line.outboundQuantity > 0)) {
      message.warning('Enter an outbound quantity for at least one item.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ salesOrderId: orderId, outboundDate: outboundDate.format('YYYY-MM-DD'), lines })
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<SalesOutboundLine> = [
    { title: 'Product Code', dataIndex: 'productCode' },
    { title: 'Product Name', dataIndex: 'productName' },
    { title: 'Unit', dataIndex: 'unit' },
    { title: 'Order Qty', dataIndex: 'orderedQuantity' },
    { title: 'Available Qty', dataIndex: 'remainingQuantity' },
    {
      title: 'Outbound Qty',
      dataIndex: 'outboundQuantity',
      render: (value, line) => <InputNumber min={0} max={line.remainingQuantity} value={value} onChange={next => updateQuantity(line.id, next)} />,
    },
  ]

  return (
    <Modal title={mode === 'create' ? 'New Sales Outbound' : `Edit Sales Outbound ${initialOutbound?.outboundNo}`} open={open} width={860} onCancel={() => !submitting && onCancel()} onOk={submit} okText={mode === 'create' ? 'Create Outbound' : 'Save Changes'} confirmLoading={submitting} destroyOnHidden>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select confirmed sales order"
            value={orderId}
            onChange={selectOrder}
            disabled={mode === 'edit'}
            style={{ width: 360 }}
            options={orders.map(order => ({ label: `${order.orderNo} · ${order.customerName}`, value: order.id }))}
          />
          <DatePicker value={outboundDate} onChange={value => setOutboundDate(value ?? dayjs())} />
        </Space>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={lines} pagination={false} locale={{ emptyText: 'Select a confirmed sales order to load its remaining items.' }} />
      </Space>
    </Modal>
  )
}

export default SalesOutboundForm
