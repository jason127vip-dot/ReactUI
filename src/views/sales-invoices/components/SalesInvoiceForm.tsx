import { useEffect, useState } from 'react'
import { Alert, DatePicker, Form, Input, Modal, Select, Table, Typography, message } from 'antd'
import dayjs from 'dayjs'
import { getInvoiceOutbounds } from '../../../services/salesInvoiceApi'
import type { InvoiceOutbound, SalesInvoice, SalesInvoiceFormValues } from '../types'

interface Props {
  invoice?: SalesInvoice
  onCancel: () => void
  onSubmit: (values: SalesInvoiceFormValues) => Promise<void>
}

const SalesInvoiceForm = ({ invoice, onCancel, onSubmit }: Props) => {
  const [outbounds, setOutbounds] = useState<InvoiceOutbound[]>([])
  const [outboundId, setOutboundId] = useState(invoice?.salesOutboundId)
  const [date, setDate] = useState(dayjs(invoice?.invoiceDate))
  const [remarks, setRemarks] = useState(invoice?.remarks ?? '')
  const [loading, setLoading] = useState(!invoice)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (invoice) return
    let active = true
    getInvoiceOutbounds().then(rows => { if (active) setOutbounds(rows) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [invoice])

  const selected = outbounds.find(row => row.id === outboundId)
  const lines = invoice?.lines ?? selected?.lines.map(line => ({
    ...line.salesOrderLine, id: line.id, quantity: line.outboundQuantity,
    amount: Math.round(line.outboundQuantity * line.salesOrderLine.unitPrice * 100) / 100,
  })) ?? []
  const submit = async () => {
    if (!outboundId || !date.isValid() || lines.length === 0) {
      message.warning('Select a confirmed sales outbound and an invoice date.')
      return
    }
    setSubmitting(true)
    try { await onSubmit({ salesOutboundId: outboundId, invoiceDate: date.format('YYYY-MM-DD'), remarks }) }
    finally { setSubmitting(false) }
  }

  return <Modal open title={invoice ? `Edit ${invoice.invoiceNo}` : 'New Sales Invoice'} width={850} onCancel={() => !submitting && onCancel()} onOk={submit} confirmLoading={submitting} okButtonProps={{ disabled: loading || error }} okText={invoice ? 'Save Changes' : 'Create Invoice'}>
    {error && <Alert type="error" showIcon title="Unable to load sales outbounds. Close and reopen this form to retry." />}
    <Form layout="vertical">
      <Form.Item label="Sales Outbound" required>
        <Select loading={loading} showSearch optionFilterProp="label" placeholder="Select a confirmed, uninvoiced outbound" value={outboundId} disabled={!!invoice} onChange={setOutboundId}
          options={invoice ? [{ value: invoice.salesOutboundId, label: `${invoice.salesOutbound.outboundNo} · ${invoice.customerName}` }] : outbounds.map(row => ({ value: row.id, label: `${row.outboundNo} · ${row.salesOrder.orderNo} · ${row.salesOrder.customer.name}` }))} />
      </Form.Item>
      <Form.Item label="Invoice Date" required><DatePicker allowClear={false} value={date} onChange={value => { if (value) setDate(value) }} /></Form.Item>
      <Table rowKey="id" dataSource={lines} pagination={false} scroll={{ x: 650 }} columns={[
        { title: 'Product Code', dataIndex: 'productCode' }, { title: 'Product', dataIndex: 'productName' },
        { title: 'Unit', dataIndex: 'unit' }, { title: 'Quantity', dataIndex: 'quantity' },
        { title: 'Unit Price', dataIndex: 'unitPrice', render: value => `$${value.toFixed(2)}` },
        { title: 'Amount', dataIndex: 'amount', render: value => `$${value.toFixed(2)}` },
      ]} />
      <Typography.Paragraph strong style={{ textAlign: 'right', marginTop: 16 }}>Total: ${lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)}</Typography.Paragraph>
      <Form.Item label="Remarks"><Input.TextArea maxLength={1000} value={remarks} onChange={event => setRemarks(event.target.value)} /></Form.Item>
    </Form>
  </Modal>
}

export default SalesInvoiceForm
