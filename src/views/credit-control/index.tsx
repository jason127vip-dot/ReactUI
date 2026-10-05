import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Space, Statistic, Table, Tag, message } from 'antd'
import { EditOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getCreditSummary, setCustomerCreditLimit, type CreditSummary, type CustomerCredit } from '../../services/creditApi'

const money = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const errorMessage = (error: unknown) => error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to load credit control data.'

const CreditControlPage = () => {
  const [summary, setSummary] = useState<CreditSummary>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState<CustomerCredit>()
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm<{ creditLimit: number }>()

  const load = async () => {
    setLoading(true); setError(undefined)
    try { setSummary(await getCreditSummary()) }
    catch (loadError) { setError(errorMessage(loadError)) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const rows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    return (summary?.customers ?? []).filter(row => !search || row.customerCode.toLowerCase().includes(search) || row.customerName.toLowerCase().includes(search))
  }, [keyword, summary])

  const edit = (row: CustomerCredit) => {
    setEditing(row)
    form.setFieldsValue({ creditLimit: row.creditLimit })
  }
  const save = async () => {
    if (!editing) return
    const { creditLimit } = await form.validateFields()
    setSaving(true)
    try {
      await setCustomerCreditLimit(editing.customerId, creditLimit)
      message.success('Customer credit limit saved')
      setEditing(undefined)
      await load()
    } catch (saveError) { message.error(errorMessage(saveError)) }
    finally { setSaving(false) }
  }

  const columns: ColumnsType<CustomerCredit> = [
    { title: 'Customer Code', dataIndex: 'customerCode', width: 140 },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Credit Limit', dataIndex: 'creditLimit', align: 'right', render: money },
    { title: 'Used Credit', dataIndex: 'usedCredit', align: 'right', render: money },
    { title: 'Available Credit', dataIndex: 'availableCredit', align: 'right', render: money },
    { title: 'Status', dataIndex: 'status', render: status => status === 'exceeded' ? <Tag color="error">Exceeded</Tag> : status === 'not_configured' ? <Tag>Not Configured</Tag> : <Tag color="success">Available</Tag> },
    { title: 'Actions', width: 90, render: (_, row) => <Button type="link" icon={<EditOutlined />} onClick={() => edit(row)}>Edit</Button> },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Space><h2 style={{ margin: 0 }}>Credit Control</h2><Tag color={summary?.enableCreditControl ? 'processing' : 'default'}>{summary?.enableCreditControl ? 'Enabled' : 'Disabled'}</Tag></Space>
      {!summary?.enableCreditControl && <Alert type="info" showIcon message="Credit control is disabled for this branch. Credit usage is calculated, but sales order confirmation is not blocked." />}
      {error && <Alert type="error" showIcon message={error} action={<Button icon={<ReloadOutlined />} onClick={() => { void load() }}>Retry</Button>} />}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Card><Statistic title="Branch Credit Limit" value={summary?.totalCreditLimit ?? 0} precision={2} prefix="$" /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Allocated to Customers" value={summary?.allocatedCredit ?? 0} precision={2} prefix="$" /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Unallocated Amount" value={summary?.unallocatedCredit ?? 0} precision={2} prefix="$" /></Card></Col>
      </Row>
      <Card title="Customer Credit Limits" extra={<Input.Search allowClear placeholder="Customer code or name" value={keyword} onChange={event => setKeyword(event.target.value)} style={{ width: 260 }} />}>
        <Table rowKey="customerId" loading={loading} dataSource={rows} columns={columns} pagination={{ pageSize: 10, showSizeChanger: true }} />
      </Card>
      <Modal title={editing ? `Credit Limit - ${editing.customerName}` : 'Credit Limit'} open={Boolean(editing)} confirmLoading={saving} onOk={() => { void save() }} onCancel={() => setEditing(undefined)}>
        <Form form={form} layout="vertical">
          <Form.Item name="creditLimit" label="Customer Credit Limit" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} prefix="$" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default CreditControlPage
