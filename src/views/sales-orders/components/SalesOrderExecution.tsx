import { useEffect, useState } from 'react'
import { Alert, Drawer, Skeleton, Space, Table, Tag, Typography } from 'antd'
import { getSalesOrderExecution } from '../../../services/salesDocumentApi'
import type { SalesInvoice } from '../../sales-invoices/types'
import { Payment, PaymentStatus } from '../../payments/types'
import { SalesOutbound, SalesOutboundStatus } from '../../sales-outbound/types'
import { SalesOrder } from '../types'

interface SalesOrderExecutionProps {
  order?: SalesOrder
  open: boolean
  onClose: () => void
}

const SalesOrderExecution = ({ order, open, onClose }: SalesOrderExecutionProps) => {
  const [outbounds, setOutbounds] = useState<SalesOutbound[]>([])
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!open || !order) return
    setLoading(true)
    setError(undefined)
    getSalesOrderExecution(order.id)
      .then(result => { setInvoices(result.invoices); setOutbounds(result.outbounds); setPayments(result.payments) })
      .catch(loadError => { console.error(loadError); setError('Failed to load order execution.') })
      .finally(() => setLoading(false))
  }, [open, order])

  const confirmedOutboundQuantity = outbounds.filter(item => item.status === SalesOutboundStatus.Confirmed).flatMap(item => item.lines).reduce((total, line) => total + line.outboundQuantity, 0)
  const confirmedPaymentAmount = payments.filter(item => item.status === PaymentStatus.Confirmed).reduce((total, payment) => total + payment.amount, 0)

  return (
    <Drawer width={760} title={order ? `Execution · ${order.orderNo}` : 'Order Execution'} open={open} onClose={onClose} destroyOnClose>
      {loading ? <Skeleton active paragraph={{ rows: 10 }} /> : error ? <Alert type="error" showIcon message={error} /> : order ? <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap><Typography.Text strong>Outbound Quantity: {confirmedOutboundQuantity}</Typography.Text><Typography.Text strong>Paid Amount: ¥{confirmedPaymentAmount.toLocaleString()}</Typography.Text></Space>
        <div><Typography.Title level={5}>Sales Outbound</Typography.Title><Table rowKey="id" pagination={false} dataSource={outbounds.flatMap(outbound => outbound.lines.map(line => ({ ...line, outboundNo: outbound.outboundNo, outboundDate: outbound.outboundDate, status: outbound.status })))} locale={{ emptyText: 'No sales outbound yet.' }} columns={[{ title: 'Outbound No.', dataIndex: 'outboundNo' }, { title: 'Date', dataIndex: 'outboundDate' }, { title: 'Product', dataIndex: 'productName' }, { title: 'Outbound Qty', dataIndex: 'outboundQuantity', render: (value, record) => `${value} ${record.unit}` }, { title: 'Status', dataIndex: 'status', render: (status: SalesOutboundStatus) => <Tag color={status === SalesOutboundStatus.Confirmed ? 'processing' : 'default'}>{status}</Tag> }]} /></div>
        <div><Typography.Title level={5}>Sales Invoices</Typography.Title><Table rowKey="id" pagination={false} dataSource={invoices} locale={{ emptyText: 'No invoices yet.' }} columns={[{ title: 'Invoice No.', dataIndex: 'invoiceNo' }, { title: 'Date', dataIndex: 'invoiceDate', render: value => value.slice(0, 10) }, { title: 'Amount', dataIndex: 'totalAmount', render: value => '¥' + value.toFixed(2) }, { title: 'Paid', dataIndex: 'paidAmount', render: value => '¥' + value.toFixed(2) }, { title: 'Status', dataIndex: 'status' }]} /></div>
        <div><Typography.Title level={5}>Payments</Typography.Title><Table rowKey="id" pagination={false} dataSource={payments} locale={{ emptyText: 'No payments yet.' }} columns={[{ title: 'Payment No.', dataIndex: 'paymentNo' }, { title: 'Invoice', dataIndex: 'invoiceNo', render: value => value || 'Legacy order payment' }, { title: 'Date', dataIndex: 'paymentDate' }, { title: 'Amount', dataIndex: 'amount', render: value => `¥${value.toLocaleString()}` }, { title: 'Method', dataIndex: 'method' }, { title: 'Status', dataIndex: 'status', render: (status: PaymentStatus) => <Tag color={status === PaymentStatus.Confirmed ? 'success' : 'default'}>{status}</Tag> }]} /></div>
      </Space> : null}
    </Drawer>
  )
}

export default SalesOrderExecution
