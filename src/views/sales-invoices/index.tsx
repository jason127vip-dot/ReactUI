import { useEffect, useState } from 'react'
import { Alert, Button, Card, DatePicker, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { cancelSalesInvoiceConfirmation, confirmSalesInvoice, createSalesInvoice, deleteSalesInvoice, getSalesInvoices, updateSalesInvoice } from '../../services/salesInvoiceApi'
import type { SalesInvoice } from './types'
import SalesInvoiceForm from './components/SalesInvoiceForm'
import SalesInvoiceDetail from './components/SalesInvoiceDetail'

const errorMessage = (error: unknown) => error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to save the invoice. Please try again.'

const SalesInvoicesPage = () => {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SalesInvoice>()
  const [selected, setSelected] = useState<SalesInvoice>()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string>()
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const load = async () => {
    setLoading(true); setError(undefined)
    try { setInvoices(await getSalesInvoices()) }
    catch (error) { setError(errorMessage(error)) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true)
    try { await action(); message.success(success); await load() }
    catch (error) { message.error(errorMessage(error)) }
    finally { setBusy(false) }
  }
  const search = keyword.trim().toLowerCase()
  const rows = invoices.filter(row =>
    (!status || row.status === status) &&
    (!dates?.[0] || row.invoiceDate.slice(0, 10) >= dates[0].format('YYYY-MM-DD')) &&
    (!dates?.[1] || row.invoiceDate.slice(0, 10) <= dates[1].format('YYYY-MM-DD')) &&
    [row.invoiceNo, row.customerName, row.salesOrder.orderNo, row.salesOutbound.outboundNo].some(value => value.toLowerCase().includes(search)),
  )
  const columns: ColumnsType<SalesInvoice> = [
    { title: 'Invoice No.', dataIndex: 'invoiceNo' },
    { title: 'Sales Outbound', render: (_, row) => row.salesOutbound.outboundNo },
    { title: 'Sales Order', render: (_, row) => row.salesOrder.orderNo },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Invoice Date', dataIndex: 'invoiceDate', render: value => value.slice(0, 10) },
    { title: 'Amount', dataIndex: 'totalAmount', render: value => `$${value.toFixed(2)}` },
    { title: 'Paid', dataIndex: 'paidAmount', render: value => `$${value.toFixed(2)}` },
    { title: 'Unpaid', dataIndex: 'unpaidAmount', render: value => `$${value.toFixed(2)}` },
    { title: 'Status', dataIndex: 'status', render: value => <Tag color={value === 'confirmed' ? 'processing' : 'default'}>{value}</Tag> },
    { title: 'Actions', render: (_, row) => <Space size={0} wrap>
      <Button type="link" onClick={() => setSelected(row)}>View / Print</Button>
      {row.status === 'draft' ? <>
        <Button type="link" disabled={busy} onClick={() => { setEditing(row); setFormOpen(true) }}>Edit</Button>
        <Popconfirm title="Confirm this invoice?" description="Payments can be recorded after confirmation." onConfirm={() => runAction(() => confirmSalesInvoice(row.id), 'Invoice confirmed')}><Button type="link" disabled={busy}>Confirm</Button></Popconfirm>
        <Popconfirm title="Delete this draft invoice?" onConfirm={() => runAction(() => deleteSalesInvoice(row.id), 'Invoice deleted')}><Button type="link" danger disabled={busy}>Delete</Button></Popconfirm>
      </> : <Popconfirm title="Cancel invoice confirmation?" description="All linked payment records must first be removed." onConfirm={() => runAction(() => cancelSalesInvoiceConfirmation(row.id), 'Invoice restored to draft')}><Button type="link" disabled={busy}>Cancel Confirmation</Button></Popconfirm>}
    </Space> },
  ]

  return <Card title="Sales Invoice" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setFormOpen(true) }}>New Sales Invoice</Button>}>
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Input.Search allowClear placeholder="Invoice, outbound, order or customer" style={{ width: 310 }} value={keyword} onChange={event => setKeyword(event.target.value)} />
        <Select allowClear placeholder="Confirmation status" style={{ width: 180 }} value={status} onChange={setStatus} options={[{ label: 'Draft', value: 'draft' }, { label: 'Confirmed', value: 'confirmed' }]} />
        <DatePicker.RangePicker value={dates} onChange={setDates} />
        <Button onClick={() => { setKeyword(''); setStatus(undefined); setDates(null) }}>Reset</Button>
        <Button icon={<ReloadOutlined />} onClick={load}>Refresh</Button>
      </Space>
      {error && <Alert showIcon type="error" title={error} />}
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1200 }} pagination={{ pageSize: 10, showSizeChanger: true }} />
    </Space>
    {formOpen && <SalesInvoiceForm invoice={editing} onCancel={() => setFormOpen(false)} onSubmit={async values => {
      try {
        if (editing) await updateSalesInvoice(editing.id, values)
        else await createSalesInvoice(values)
        setFormOpen(false); message.success(editing ? 'Invoice updated' : 'Invoice created'); await load()
      } catch (error) { message.error(errorMessage(error)) }
    }} />}
    {selected && <SalesInvoiceDetail invoice={selected} onClose={() => setSelected(undefined)} />}
  </Card>
}

export default SalesInvoicesPage
