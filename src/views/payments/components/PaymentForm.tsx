import { useEffect, useMemo, useState } from 'react'
import { DatePicker, Descriptions, Input, InputNumber, Modal, Select, Space, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { getPaymentOrderSummaries } from '../../../services/salesDocumentApi'
import { Payment, PaymentOrderSummary } from '../types'

interface PaymentFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialPayment?: Payment
  onCancel: () => void
  onSubmit: (values: { salesOrderId: string; paymentDate: string; amount: number; method: string; referenceNo?: string }) => Promise<void> | void
}

const PaymentForm = ({ mode, open, initialPayment, onCancel, onSubmit }: PaymentFormProps) => {
  const [orders, setOrders] = useState<PaymentOrderSummary[]>([])
  const [orderId, setOrderId] = useState<string>()
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [amount, setAmount] = useState<number>()
  const [method, setMethod] = useState('Bank Transfer')
  const [referenceNo, setReferenceNo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setOrderId(initialPayment?.salesOrderId); setAmount(initialPayment?.amount); setDate(initialPayment ? dayjs(initialPayment.paymentDate) : dayjs()); setMethod(initialPayment?.method ?? 'Bank Transfer'); setReferenceNo(initialPayment?.referenceNo ?? '')
    getPaymentOrderSummaries().then(setOrders).catch(error => {
      console.error(error)
      message.error('Failed to load unpaid sales orders.')
    })
  }, [initialPayment, open])

  const selectedOrder = useMemo(() => orders.find(order => order.id === orderId), [orderId, orders])
  const selectOrder = (id: string) => {
    setOrderId(id)
    setAmount(orders.find(order => order.id === id)?.unpaidAmount)
  }

  const submit = async () => {
    if (!orderId || !amount || amount <= 0) {
      message.warning('Select an order and enter a payment amount.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ salesOrderId: orderId, paymentDate: date.format('YYYY-MM-DD'), amount, method, referenceNo: referenceNo || undefined })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'create' ? 'New Payment' : `Edit Payment ${initialPayment?.paymentNo}`} open={open} onCancel={() => !submitting && onCancel()} onOk={submit} okText={mode === 'create' ? 'Create Payment' : 'Save Changes'} confirmLoading={submitting} destroyOnHidden>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Select showSearch optionFilterProp="label" placeholder="Select sales order" value={orderId} onChange={selectOrder} disabled={mode === 'edit'} options={orders.map(order => ({ label: `${order.orderNo} · ${order.customerName}`, value: order.id }))} />
        {selectedOrder && <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Order Amount">¥{selectedOrder.orderAmount.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Paid Amount">¥{selectedOrder.paidAmount.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Unpaid Amount">¥{selectedOrder.unpaidAmount.toLocaleString()}</Descriptions.Item>
        </Descriptions>}
        <DatePicker value={date} onChange={value => setDate(value ?? dayjs())} />
        <InputNumber min={0.01} max={selectedOrder?.unpaidAmount} precision={2} prefix="¥" placeholder="Payment amount" value={amount} onChange={value => setAmount(value ?? undefined)} style={{ width: '100%' }} />
        <Select value={method} onChange={setMethod} options={['Bank Transfer', 'Cash', 'Card', 'Cheque'].map(value => ({ label: value, value }))} />
        <Input placeholder="Reference No. (optional)" value={referenceNo} onChange={event => setReferenceNo(event.target.value)} />
      </Space>
    </Modal>
  )
}

export default PaymentForm
