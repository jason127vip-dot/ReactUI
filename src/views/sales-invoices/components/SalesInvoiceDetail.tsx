import { Button, Descriptions, Drawer, Space, Table, Tag, Typography, message } from 'antd'
import { PrinterOutlined } from '@ant-design/icons'
import type { SalesInvoice } from '../types'

// Assign all business text through textContent so customer data cannot inject HTML.
const printInvoice = (invoice: SalesInvoice) => {
  const preview = window.open('', '_blank', 'width=950,height=800')
  if (!preview) { message.warning('Allow pop-ups to print this invoice.'); return }
  preview.opener = null
  const doc = preview.document
  doc.title = invoice.invoiceNo
  const style = doc.createElement('style')
  style.textContent = '@page{size:A4;margin:18mm}body{font:14px Arial,sans-serif;color:#222;margin:32px}h1{margin-bottom:6px}p{white-space:pre-wrap;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}th:nth-last-child(-n+3),td:nth-last-child(-n+3){text-align:right}.total{text-align:right;font-size:18px;font-weight:bold}button{padding:10px 20px}@media print{body{margin:0}button{display:none}}'
  doc.head.append(style)
  const append = (tag: string, text: string, parent: HTMLElement = doc.body) => {
    const element = doc.createElement(tag); element.textContent = text; parent.append(element); return element
  }
  append('h1', 'Sales Invoice')
  append('p', `${invoice.invoiceNo} · ${invoice.status === 'draft' ? 'DRAFT — Not confirmed' : 'Confirmed'}`)
  append('p', `Invoice Date: ${invoice.invoiceDate.slice(0, 10)}\nSales Order: ${invoice.salesOrder.orderNo}\nSales Outbound: ${invoice.salesOutbound.outboundNo}`)
  append('h3', 'Bill To')
  append('p', `${invoice.customerName}\n${invoice.customerAddress}`)
  if (invoice.customerPoNo) append('p', `Customer PO: ${invoice.customerPoNo}`)
  if (invoice.paymentTerms) append('p', `Payment Terms: ${invoice.paymentTerms}`)
  const table = append('table', '')
  const header = append('tr', '', append('thead', '', table))
  for (const title of ['Code', 'Product / Specification', 'Unit', 'Qty', 'Unit Price', 'Amount']) append('th', title, header)
  const body = append('tbody', '', table)
  for (const line of invoice.lines) {
    const row = append('tr', '', body)
    for (const value of [line.productCode, [line.productName, line.specification].filter(Boolean).join(' / '), line.unit, String(line.quantity), `$${line.unitPrice.toFixed(2)}`, `$${line.amount.toFixed(2)}`]) append('td', value, row)
  }
  append('p', `Total: $${invoice.totalAmount.toFixed(2)}`).className = 'total'
  if (invoice.remarks) append('p', `Remarks: ${invoice.remarks}`)
  const button = append('button', 'Print / Save as PDF')
  button.onclick = () => preview.print()
  preview.focus()
  preview.print()
}

const SalesInvoiceDetail = ({ invoice, onClose }: { invoice: SalesInvoice; onClose: () => void }) => <Drawer open width={900} title={`Sales Invoice · ${invoice.invoiceNo}`} onClose={onClose} extra={<Button icon={<PrinterOutlined />} onClick={() => printInvoice(invoice)}>Print</Button>}>
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
      <Descriptions.Item label="Invoice No.">{invoice.invoiceNo}</Descriptions.Item>
      <Descriptions.Item label="Status"><Tag color={invoice.status === 'confirmed' ? 'processing' : 'default'}>{invoice.status}</Tag></Descriptions.Item>
      <Descriptions.Item label="Invoice Date">{invoice.invoiceDate.slice(0, 10)}</Descriptions.Item>
      <Descriptions.Item label="Customer">{invoice.customerName}</Descriptions.Item>
      <Descriptions.Item label="Sales Order">{invoice.salesOrder.orderNo}</Descriptions.Item>
      <Descriptions.Item label="Sales Outbound">{invoice.salesOutbound.outboundNo}</Descriptions.Item>
      <Descriptions.Item label="Address">{invoice.customerAddress || '—'}</Descriptions.Item>
      <Descriptions.Item label="Customer PO">{invoice.customerPoNo || '—'}</Descriptions.Item>
      <Descriptions.Item label="Payment Terms">{invoice.paymentTerms || '—'}</Descriptions.Item>
      <Descriptions.Item label="Remarks">{invoice.remarks || '—'}</Descriptions.Item>
    </Descriptions>
    <Table rowKey="id" dataSource={invoice.lines} pagination={false} scroll={{ x: 650 }} columns={[
      { title: 'Code', dataIndex: 'productCode' }, { title: 'Product', dataIndex: 'productName' }, { title: 'Specification', dataIndex: 'specification' },
      { title: 'Unit', dataIndex: 'unit' }, { title: 'Quantity', dataIndex: 'quantity' },
      { title: 'Unit Price', dataIndex: 'unitPrice', render: value => `$${value.toFixed(2)}` },
      { title: 'Amount', dataIndex: 'amount', render: value => `$${value.toFixed(2)}` },
    ]} />
    <Typography.Text strong>Total: ${invoice.totalAmount.toFixed(2)} · Paid: ${invoice.paidAmount.toFixed(2)} · Unpaid: ${invoice.unpaidAmount.toFixed(2)}</Typography.Text>
  </Space>
</Drawer>

export default SalesInvoiceDetail
