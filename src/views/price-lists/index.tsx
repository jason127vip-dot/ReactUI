import { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Table, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import { getCustomers, getProducts } from '../../services/masterDataApi'
import { createPriceList, deletePriceList, getPriceLists, updatePriceList, type PriceList, type PriceListValues } from '../../services/priceListApi'
import { CustomerStatus, type Customer } from '../customers/types'
import { ProductStatus, type Product } from '../products/types'

type FormValues = Omit<PriceListValues, 'startDate' | 'endDate'> & { dateRange: [Dayjs, Dayjs] }
const errorMessage = (error: unknown) => error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to save price.'

const PriceListsPage = () => {
  const [rows, setRows] = useState<PriceList[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<PriceList>()
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [form] = Form.useForm<FormValues>()

  const load = async () => {
    setLoading(true)
    try { setRows(await getPriceLists()) }
    catch (error) { message.error(errorMessage(error)) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    void load()
    Promise.all([getCustomers(), getProducts()]).then(([customerRows, productRows]) => {
      setCustomers(customerRows.filter(row => row.status === CustomerStatus.Active))
      setProducts(productRows.filter(row => row.status === ProductStatus.Active))
    }).catch(error => message.error(errorMessage(error)))
  }, [])

  const visibleRows = useMemo(() => {
    const search = keyword.trim().toLowerCase()
    return rows.filter(row => !search || [row.customerCode, row.customerName, row.productCode, row.productName].some(value => value.toLowerCase().includes(search)))
  }, [keyword, rows])

  const showForm = (row?: PriceList) => {
    setEditing(row)
    form.resetFields()
    if (row) form.setFieldsValue({ customerId: row.customerId, productId: row.productId, unitPrice: row.unitPrice, dateRange: [dayjs(row.startDate), dayjs(row.endDate)] })
    setOpen(true)
  }
  const save = async () => {
    const values = await form.validateFields()
    const input: PriceListValues = {
      customerId: values.customerId,
      productId: values.productId,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      unitPrice: values.unitPrice,
    }
    setSaving(true)
    try {
      if (editing) await updatePriceList(editing.id, input)
      else await createPriceList(input)
      message.success('Sales price saved')
      setOpen(false)
      await load()
    } catch (error) { message.error(errorMessage(error)) }
    finally { setSaving(false) }
  }
  const remove = (row: PriceList) => Modal.confirm({
    title: 'Delete this sales price?',
    content: `${row.customerName} · ${row.productName} · ${row.startDate} to ${row.endDate}`,
    centered: true,
    okText: 'Delete',
    okButtonProps: { danger: true },
    onOk: async () => {
      try { await deletePriceList(row.id); message.success('Sales price deleted'); await load() }
      catch (error) { message.error(errorMessage(error)) }
    },
  })

  const columns: ColumnsType<PriceList> = [
    { title: 'Customer', render: (_, row) => `${row.customerCode} · ${row.customerName}` },
    { title: 'Product', render: (_, row) => `${row.productCode} · ${row.productName}${row.specification ? ` · ${row.specification}` : ''}` },
    { title: 'Start Date', dataIndex: 'startDate', width: 120 },
    { title: 'End Date', dataIndex: 'endDate', width: 120 },
    { title: 'Sales Price', dataIndex: 'unitPrice', align: 'right', width: 140, render: value => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { title: 'Actions', width: 150, render: (_, row) => <Space><Button type="link" icon={<EditOutlined />} onClick={() => showForm(row)}>Edit</Button><Button type="link" danger icon={<DeleteOutlined />} onClick={() => remove(row)}>Delete</Button></Space> },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}><h2 style={{ margin: 0 }}>Sales Price Lists</h2><Button type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>New Sales Price</Button></Space>
      <Table title={() => <Input.Search allowClear placeholder="Customer or product" value={keyword} onChange={event => setKeyword(event.target.value)} style={{ width: 280 }} />} rowKey="id" loading={loading} dataSource={visibleRows} columns={columns} />
      <Modal title={editing ? 'Edit Sales Price' : 'New Sales Price'} open={open} confirmLoading={saving} onOk={() => { void save() }} onCancel={() => setOpen(false)} destroyOnHidden>
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="Customer" rules={[{ required: true, message: 'Select a customer' }]}>
            <Select showSearch optionFilterProp="label" options={customers.map(row => ({ value: row.id, label: `${row.customerCode} · ${row.name}` }))} />
          </Form.Item>
          <Form.Item name="productId" label="Product" rules={[{ required: true, message: 'Select a product' }]}>
            <Select showSearch optionFilterProp="label" options={products.map(row => ({ value: row.id, label: `${row.productCode} · ${row.name}${row.specification ? ` · ${row.specification}` : ''}` }))} />
          </Form.Item>
          <Form.Item name="dateRange" label="Effective Date Range" rules={[{ required: true, message: 'Select a start and end date' }]}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unitPrice" label="Sales Price" rules={[{ required: true, message: 'Enter a sales price' }]}><InputNumber min={0} precision={2} prefix="$" style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default PriceListsPage
