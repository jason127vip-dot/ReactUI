import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, DatePicker, Empty, Input, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { cancelPaymentConfirmation, confirmPayment, createPayment, deletePayment, getPayments, updatePayment } from '../../services/salesDocumentApi'
import PaymentForm from './components/PaymentForm'
import { Payment, PaymentStatus } from './types'

const statusColorMap: Record<PaymentStatus, string> = { [PaymentStatus.Draft]: 'default', [PaymentStatus.Confirmed]: 'success' }

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [formVisible, setFormVisible] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingPayment, setEditingPayment] = useState<Payment>()
  const [keyword, setKeyword] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>()
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const loadPayments = async () => {
    setLoading(true); setError(undefined)
    try { setPayments(await getPayments()) } catch (loadError) { console.error(loadError); setError('Failed to load payments.') } finally { setLoading(false) }
  }
  useEffect(() => { loadPayments() }, [])
  const paymentMethods = useMemo(
    () => [...new Set(payments.map(payment => payment.method))].sort(),
    [payments],
  )
  const filteredPayments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return payments.filter(payment => {
      const matchesKeyword = !normalizedKeyword || [
        payment.paymentNo,
        payment.orderNo,
        payment.customerName,
        payment.referenceNo,
      ].some(value => value?.toLowerCase().includes(normalizedKeyword))
      const matchesMethod = !methodFilter || payment.method === methodFilter
      const matchesStatus = !statusFilter || payment.status === statusFilter
      const matchesStartDate = !dateRange?.[0] || payment.paymentDate >= dateRange[0].format('YYYY-MM-DD')
      const matchesEndDate = !dateRange?.[1] || payment.paymentDate <= dateRange[1].format('YYYY-MM-DD')
      return matchesKeyword && matchesMethod && matchesStatus && matchesStartDate && matchesEndDate
    })
  }, [dateRange, keyword, methodFilter, payments, statusFilter])
  const confirm = async (payment: Payment) => {
    try { await confirmPayment(payment.id); message.success(`${payment.paymentNo} confirmed`); await loadPayments() } catch (error) { console.error(error); message.error('Failed to confirm payment.') }
  }
  const cancelConfirmation = async (payment: Payment) => {
    try { await cancelPaymentConfirmation(payment.id); message.success(`${payment.paymentNo} restored to draft`); await loadPayments() } catch (error) { console.error(error); message.error('Failed to cancel payment confirmation.') }
  }
  const remove = async (payment: Payment) => {
    try { await deletePayment(payment.id); message.success(`${payment.paymentNo} deleted`); await loadPayments() } catch (error) { console.error(error); message.error('Failed to delete payment.') }
  }
  const columns: ColumnsType<Payment> = [
    { title: 'Payment No.', dataIndex: 'paymentNo' }, { title: 'Sales Order', dataIndex: 'orderNo' }, { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Payment Date', dataIndex: 'paymentDate' }, { title: 'Amount', dataIndex: 'amount', render: value => `¥${value.toLocaleString()}` }, { title: 'Method', dataIndex: 'method' },
    { title: 'Status', dataIndex: 'status', render: (status: PaymentStatus) => <Tag color={statusColorMap[status]}>{status}</Tag> },
    { title: 'Actions', render: (_value, payment) => <Space>{payment.status === PaymentStatus.Draft && <><Button type="link" onClick={() => { setFormMode('edit'); setEditingPayment(payment); setFormVisible(true) }}>Edit</Button><Popconfirm title="Confirm this payment?" okText="Confirm payment" cancelText="Cancel" onConfirm={() => confirm(payment)}><Button type="link">Confirm</Button></Popconfirm><Popconfirm title="Delete this payment?" okText="Delete payment" cancelText="Cancel" okButtonProps={{ danger: true }} onConfirm={() => remove(payment)}><Button type="link" danger>Delete</Button></Popconfirm></>}{payment.status === PaymentStatus.Confirmed && <Popconfirm title="Cancel payment confirmation?" description="The payment amount will be released." okText="Cancel confirmation" cancelText="Keep confirmed" onConfirm={() => cancelConfirmation(payment)}><Button type="link">Cancel Confirmation</Button></Popconfirm>}</Space> },
  ]
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title="Payments"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setFormMode('create'); setEditingPayment(undefined); setFormVisible(true) }}>New Payment</Button>}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Payment no., sales order, customer or reference"
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              style={{ width: 350 }}
            />
            <Select
              allowClear
              placeholder="Payment method"
              value={methodFilter}
              onChange={setMethodFilter}
              style={{ width: 170 }}
              options={paymentMethods.map(method => ({ label: method, value: method }))}
            />
            <Select
              allowClear
              placeholder="Confirmation status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              options={[
                { label: 'Draft', value: PaymentStatus.Draft },
                { label: 'Confirmed', value: PaymentStatus.Confirmed },
              ]}
            />
            <DatePicker.RangePicker value={dateRange} onChange={setDateRange} />
            <Button onClick={() => {
              setKeyword('')
              setMethodFilter(undefined)
              setStatusFilter(undefined)
              setDateRange(null)
            }}>
              Reset
            </Button>
          </Space>
          {error && <Alert type="error" showIcon message={error} action={<Button size="small" icon={<ReloadOutlined />} onClick={loadPayments}>Retry</Button>} />}
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filteredPayments}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{ emptyText: <Empty description="No payments found." /> }}
          />
        </Space>
      </Card>
      <PaymentForm
        mode={formMode}
        open={formVisible}
        initialPayment={editingPayment}
        onCancel={() => { setFormVisible(false); setEditingPayment(undefined) }}
        onSubmit={async values => {
          try {
            if (formMode === 'create') {
              await createPayment(values)
              message.success('Payment created successfully')
            } else if (editingPayment) {
              await updatePayment(editingPayment.id, values)
              message.success('Payment updated')
            }
            setFormVisible(false)
            setEditingPayment(undefined)
            await loadPayments()
          } catch (error) {
            console.error(error)
            message.error('Failed to save payment.')
          }
        }}
      />
    </Space>
  )
}

export default PaymentsPage
