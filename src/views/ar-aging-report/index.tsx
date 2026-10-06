import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, DatePicker, Input, Row, Select, Space, Statistic, Table, Tag } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import { getARAgingReport, type ARAgingBucket, type ARAgingReportRow } from '../../services/analyticsApi'

const buckets: ARAgingBucket[] = ['0-30 Days', '31-60 Days', '61-90 Days', '91-120 Days', '120+ Days']
const bucketColors: Record<ARAgingBucket, string> = {
  '0-30 Days': 'green',
  '31-60 Days': 'gold',
  '61-90 Days': 'orange',
  '91-120 Days': 'volcano',
  '120+ Days': 'red',
}
const money = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const ARAgingReportPage = () => {
  const [rows, setRows] = useState<ARAgingReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [keyword, setKeyword] = useState('')
  const [selectedBuckets, setSelectedBuckets] = useState<ARAgingBucket[]>([])
  const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null)

  const load = async () => {
    setLoading(true)
    setError(undefined)
    try { setRows(await getARAgingReport()) }
    catch (loadError) { console.error(loadError); setError('Failed to load the AR aging report.') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const filteredRows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    const start = dates?.[0]?.format('YYYY-MM-DD')
    const end = dates?.[1]?.format('YYYY-MM-DD')
    return rows.filter(row =>
      (!search || [row.invoiceNo, row.orderNo, row.customerName].some(value => value.toLowerCase().includes(search))) &&
      (!selectedBuckets.length || selectedBuckets.includes(row.agingBucket)) &&
      (!start || row.invoiceDate >= start) && (!end || row.invoiceDate <= end),
    )
  }, [dates, keyword, rows, selectedBuckets])
  const totals = useMemo(() => filteredRows.reduce((result, row) => ({
    invoice: result.invoice + row.invoiceAmount,
    paid: result.paid + row.paidAmount,
    outstanding: result.outstanding + row.outstandingAmount,
  }), { invoice: 0, paid: 0, outstanding: 0 }), [filteredRows])

  const columns: ColumnsType<ARAgingReportRow> = [
    { title: 'Invoice No.', dataIndex: 'invoiceNo' },
    { title: 'Order No.', dataIndex: 'orderNo' },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Invoice Date', dataIndex: 'invoiceDate', width: 120 },
    { title: 'Invoice Amount', dataIndex: 'invoiceAmount', align: 'right', render: money },
    { title: 'Paid Amount', dataIndex: 'paidAmount', align: 'right', render: money },
    { title: 'Outstanding', dataIndex: 'outstandingAmount', align: 'right', render: money },
    { title: 'Aging Days', dataIndex: 'agingDays', align: 'right', width: 110 },
    { title: 'Aging Bucket', dataIndex: 'agingBucket', width: 130, render: (bucket: ARAgingBucket) => <Tag color={bucketColors[bucket]}>{bucket}</Tag> },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space wrap>
          <Input allowClear placeholder="Invoice, order or customer" value={keyword} onChange={event => setKeyword(event.target.value)} style={{ width: 260 }} />
          <Select mode="multiple" allowClear placeholder="Aging bucket" value={selectedBuckets} onChange={setSelectedBuckets} options={buckets.map(value => ({ label: value, value }))} style={{ width: 260 }} />
          <DatePicker.RangePicker value={dates} onChange={value => setDates(value)} />
          <Button onClick={() => { setKeyword(''); setSelectedBuckets([]); setDates(null) }}>Reset</Button>
        </Space>
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card><Statistic title="Invoice Amount" value={totals.invoice} precision={2} prefix="$" /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Paid Amount" value={totals.paid} precision={2} prefix="$" /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Outstanding Amount" value={totals.outstanding} precision={2} prefix="$" /></Card></Col>
      </Row>
      <Card title="AR Aging Report">
        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} action={<Button size="small" icon={<ReloadOutlined />} onClick={() => { void load() }}>Retry</Button>} />}
        <Table rowKey="id" loading={loading} columns={columns} dataSource={filteredRows} scroll={{ x: 1200 }} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
    </Space>
  )
}

export default ARAgingReportPage
