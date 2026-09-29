import { useEffect, useState } from 'react'
import { Form, Input, InputNumber, Modal, Select } from 'antd'
import { Product, ProductFormValues, ProductStatus } from '../types'

interface ProductFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialValues?: Product
  onSubmit: (values: ProductFormValues) => Promise<void> | void
  onCancel: () => void
}

const statusOptions = [
  { label: 'Active', value: ProductStatus.Active },
  { label: 'Inactive', value: ProductStatus.Inactive },
]

const ProductForm = ({ mode, open, initialValues, onSubmit, onCancel }: ProductFormProps) => {
  const [form] = Form.useForm<ProductFormValues>()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        productCode: initialValues?.productCode,
        barcode: initialValues?.barcode,
        name: initialValues?.name,
        specification: initialValues?.specification,
        unit: initialValues?.unit,
        unitPrice: initialValues?.unitPrice,
        status: initialValues?.status ?? ProductStatus.Active,
      })
    } else {
      form.resetFields()
    }
  }, [form, initialValues, open])

  const handleFinish = async (values: ProductFormValues) => {
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
      title={mode === 'create' ? 'New Product' : 'Edit Product'}
      open={open}
      onCancel={() => !submitting && onCancel()}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="productCode"
          label="Product Code"
          rules={[{ required: true, message: 'Please enter a product code' }]}
        >
          <Input placeholder="e.g. PRD-1001" />
        </Form.Item>
        <Form.Item name="barcode" label="Barcode">
          <Input placeholder="Scan or enter a barcode" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: 'Please enter a product name' }]}
        >
          <Input placeholder="e.g. Wireless Barcode Scanner" />
        </Form.Item>
        <Form.Item name="specification" label="Specification">
          <Input placeholder="e.g. Model X200, Black" />
        </Form.Item>
        <Form.Item name="unit" label="Unit" rules={[{ required: true, message: 'Please enter a unit' }]}>
          <Input placeholder="e.g. pcs" />
        </Form.Item>
        <Form.Item
          name="unitPrice"
          label="Unit Price"
          rules={[{ required: true, message: 'Please enter a unit price' }]}
        >
          <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProductForm
