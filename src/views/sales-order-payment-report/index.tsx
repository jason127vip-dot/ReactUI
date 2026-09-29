import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Input, Select, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ReloadOutlined } from '@ant-design/icons'
import { getSalesOrderPaymentReport } from '../../utils/mockData'
import { SalesOrderPaymentReportRow, SalesOrderPaymentStatus } from './types'

const statusColorMap: Record<SalesOrderPaymentStatus, string> = {
  [SalesOrderPaymentStatus.Unpaid]: 'error',
  [SalesOrderPaymentStatus.PartiallyPaid]: 'warning',
  [SalesOrderPaymentStatus.Paid]: 'success',
}

const SalesOrderPaymentReportPage = () => {
  const [rows, setRows] = useState<SalesOrderPaymentReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [keyword, setKeyword] = useState('')
  const [statuses, setStatuses] = useState<SalesOrderPaymentStatus[]>([])

  const loadReport = async () => {
    setLoading(true)
    setError(undefined)
    try { setRows(await getSalesOrderPaymentReport()) } catch (loadError) { console.error(loadError); setError('Failed to load sales order payment report.') } finally { setLoading(false) }
  }

  useEffect(() => { loadReport() }, [])

  const filteredRows = useMemo(() => rows.filter(row => {
    const matchesKeyword = !keyword || [row.orderNo, row.customerName].some(value => value.toLowerCase().includes(keyword.toLowerCase()))
    return matchesKeyword && (!statuses.length || statuses.includes(row.paymentStatus))
  }), [keyword, rows, statuses])

  const columns: ColumnsType<SalesOrderPaymentReportRow> = [
    { title: 'Order No.', dataIndex: 'orderNo' }, { title: 'Customer', dataIndex: 'customerName' }, { title: 'Order Date', dataIndex: 'orderDate' },
    { title: 'Order Amount', dataIndex: 'orderAmount', render: value => `¥${value.toLocaleString()}` }, { title: 'Paid Amount', dataIndex: 'paidAmount', render: value => `¥${value.toLocaleString()}` }, { title: 'Unpaid Amount', dataIndex: 'unpaidAmount', render: value => `¥${value.toLocaleString()}` },
    { title: 'Last Payment Date', dataIndex: 'lastPaymentDate', render: value => value || '-' }, { title: 'Payment Status', dataIndex: 'paymentStatus', render: (status: SalesOrderPaymentStatus) => <Tag color={statusColorMap[status]}>{status}</Tag> },
  ]

  return <Space direction="vertical" size="large" style={{ width: '100%' }}><Card><Space wrap><Input allowClear placeholder="Search order no. or customer" value={keyword} onChange={event => setKeyword(event.target.value)} style={{ width: 260 }} /><Select mode="multiple" allowClear placeholder="Payment status" value={statuses} onChange={setStatuses} style={{ width: 220 }} options={Object.values(SalesOrderPaymentStatus).map(value => ({ label: value, value }))} /><Button onClick={() => { setKeyword(''); setStatuses([]) }}>Reset</Button></Space></Card><Card title="Sales Order Payment Report"><Space direction="vertical" size="middle" style={{ width: '100%' }}>{error && <Alert type="error" showIcon message={error} action={<Button size="small" icon={<ReloadOutlined />} onClick={loadReport}>Retry</Button>} />}<Table rowKey="id" loading={loading} columns={columns} dataSource={filteredRows} pagination={{ pageSize: 10, showSizeChanger: true }} /></Space></Card></Space>
}

export default SalesOrderPaymentReportPage
