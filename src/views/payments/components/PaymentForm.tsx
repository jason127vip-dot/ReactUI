import { useEffect, useMemo, useState } from 'react'
import { Alert, DatePicker, Descriptions, Input, InputNumber, Modal, Select, Space, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { getPaymentInvoiceSummaries } from '../../../services/salesDocumentApi'
import { Payment, PaymentInvoiceSummary } from '../types'

interface PaymentFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialPayment?: Payment
  onCancel: () => void
  onSubmit: (values: { salesInvoiceId: string; paymentDate: string; amount: number; method: string; referenceNo?: string }) => Promise<void> | void
}

const PaymentForm = ({ mode, open, initialPayment, onCancel, onSubmit }: PaymentFormProps) => {
  const [invoices, setInvoices] = useState<PaymentInvoiceSummary[]>([])
  const [invoiceId, setInvoiceId] = useState<string>()
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [amount, setAmount] = useState<number>()
  const [method, setMethod] = useState('Bank Transfer')
  const [referenceNo, setReferenceNo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setInvoiceId(initialPayment?.salesInvoiceId); setAmount(initialPayment?.amount); setDate(initialPayment ? dayjs(initialPayment.paymentDate) : dayjs()); setMethod(initialPayment?.method ?? 'Bank Transfer'); setReferenceNo(initialPayment?.referenceNo ?? '')
    setInvoices([])
    getPaymentInvoiceSummaries().then(rows => setInvoices(initialPayment ? rows.filter(row => row.salesOrderId === initialPayment.salesOrderId) : rows)).catch(error => {
      console.error(error)
      message.error('Failed to load unpaid sales invoices.')
    })
  }, [initialPayment, open])

  const selectedInvoice = useMemo(() => invoices.find(order => order.id === invoiceId), [invoiceId, invoices])
  const selectInvoice = (id: string) => {
    setInvoiceId(id)
    setAmount(invoices.find(order => order.id === id)?.unpaidAmount)
  }

  const submit = async () => {
    if (!selectedInvoice || !invoiceId || !amount || amount <= 0 || amount > selectedInvoice.unpaidAmount) {
      message.warning('Select an unpaid invoice and enter an amount within its unpaid balance.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ salesInvoiceId: invoiceId, paymentDate: date.format('YYYY-MM-DD'), amount, method, referenceNo: referenceNo || undefined })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={mode === 'create' ? 'New Payment' : `Edit Payment ${initialPayment?.paymentNo}`} open={open} onCancel={() => !submitting && onCancel()} onOk={submit} okText={mode === 'create' ? 'Create Payment' : 'Save Changes'} confirmLoading={submitting} destroyOnHidden>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Select showSearch optionFilterProp="label" placeholder="Select confirmed invoice" value={invoiceId} onChange={selectInvoice} disabled={mode === 'edit' && !!initialPayment?.salesInvoiceId} options={invoices.map(order => ({ label: `${order.invoiceNo} · ${order.orderNo} · ${order.customerName}`, value: order.id }))} />
        {selectedInvoice && <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Invoice Amount">¥{selectedInvoice.invoiceAmount.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Paid Amount">¥{selectedInvoice.paidAmount.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Unpaid Amount">¥{selectedInvoice.unpaidAmount.toLocaleString()}</Descriptions.Item>
        </Descriptions>}
        {!!selectedInvoice?.legacyPaidAmount && <Alert type="warning" showIcon title="Legacy payments need allocation" description="Cancel confirmation of the existing order payments and assign each to an invoice before confirming invoice payments." />}
        <DatePicker value={date} onChange={value => setDate(value ?? dayjs())} />
        <InputNumber min={0.01} max={selectedInvoice?.unpaidAmount} precision={2} prefix="¥" placeholder="Payment amount" value={amount} onChange={value => setAmount(value ?? undefined)} style={{ width: '100%' }} />
        <Select value={method} onChange={setMethod} options={['Bank Transfer', 'Cash', 'Card', 'Cheque'].map(value => ({ label: value, value }))} />
        <Input placeholder="Reference No. (optional)" value={referenceNo} onChange={event => setReferenceNo(event.target.value)} />
      </Space>
    </Modal>
  )
}

export default PaymentForm
