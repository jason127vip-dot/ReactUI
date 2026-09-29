import { useEffect, useState } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import { Customer, CustomerFormValues, CustomerStatus } from '../types'

export interface CustomerFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialValues?: Customer
  onSubmit: (values: CustomerFormValues) => Promise<void> | void
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: CustomerStatus.Active },
  { label: 'Inactive', value: CustomerStatus.Inactive },
]

const CustomerForm = ({ mode, open, initialValues, onSubmit, onCancel }: CustomerFormProps) => {
  const [form] = Form.useForm<CustomerFormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        customerCode: initialValues?.customerCode,
        name: initialValues?.name,
        contactPerson: initialValues?.contactPerson,
        phone: initialValues?.phone,
        email: initialValues?.email,
        address: initialValues?.address,
        paymentTerms: initialValues?.paymentTerms,
        status: initialValues?.status ?? CustomerStatus.Active,
        notes: initialValues?.notes,
      })
    } else {
      form.resetFields()
    }
  }, [form, initialValues, open])

  const handleFinish = async (values: CustomerFormValues) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
      form.resetFields()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={mode === 'create' ? 'New Customer' : 'Edit Customer'}
      open={open}
      onCancel={() => !submitting && onCancel()}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="customerCode"
          label="Customer Code"
          rules={[{ required: true, message: 'Please enter a customer code' }]}
        >
          <Input placeholder="e.g. CUS-1001" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Customer Name"
          rules={[{ required: true, message: 'Please enter a customer name' }]}
        >
          <Input placeholder="e.g. Acme Corporation" />
        </Form.Item>
        <Form.Item
          name="contactPerson"
          label="Contact Person"
          rules={[{ required: true, message: 'Please enter a contact person' }]}
        >
          <Input placeholder="e.g. Alex Chen" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input placeholder="Phone number" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Please enter a valid email' }]}>
          <Input placeholder="contact@example.com" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea rows={2} placeholder="Customer address" />
        </Form.Item>
        <Form.Item name="paymentTerms" label="Payment Terms">
          <Input placeholder="e.g. Net 30" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Additional customer information" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CustomerForm
