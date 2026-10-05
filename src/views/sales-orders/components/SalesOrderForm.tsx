import { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Input, InputNumber, Modal, Select, Space, Table, Typography, message } from 'antd'
import { DeleteOutlined, ScanOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { getCustomers, getProducts } from '../../../services/masterDataApi'
import { resolveSalesPrice } from '../../../services/priceListApi'
import { Customer, CustomerStatus } from '../../customers/types'
import { Product, ProductStatus } from '../../products/types'
import { SalesOrder, SalesOrderFormValues, SalesOrderLine } from '../types'

interface SalesOrderFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialOrder?: SalesOrder
  onCancel: () => void
  onSubmit: (values: SalesOrderFormValues) => Promise<void> | void
}

const productToLine = (product: Product, unitPrice: number): SalesOrderLine => ({
  id: `${product.id}-${Date.now()}`,
  productId: product.id,
  productCode: product.productCode,
  barcode: product.barcode,
  productName: product.name,
  specification: product.specification,
  unit: product.unit,
  unitPrice,
  quantity: 1,
  amount: unitPrice,
})

const SalesOrderForm = ({ mode, open, initialOrder, onCancel, onSubmit }: SalesOrderFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState<string>()
  const [customerPoNo, setCustomerPoNo] = useState('')
  const [expectedOutboundDate, setExpectedOutboundDate] = useState<Dayjs | null>(null)
  const [salesperson, setSalesperson] = useState('')
  const [remarks, setRemarks] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>()
  const [orderDate, setOrderDate] = useState<Dayjs>(dayjs())
  const [scanValue, setScanValue] = useState('')
  const [lines, setLines] = useState<SalesOrderLine[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [lookingUpProduct, setLookingUpProduct] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoadingCustomers(true)
    getCustomers()
      .then(data => setCustomers(data.filter(customer => customer.status === CustomerStatus.Active)))
      .catch(error => {
        console.error(error)
        message.error('Failed to load customers.')
      })
      .finally(() => setLoadingCustomers(false))
    getProducts()
      .then(data => setProducts(data.filter(product => product.status === ProductStatus.Active)))
      .catch(error => {
        console.error(error)
        message.error('Failed to load products.')
      })
  }, [open])

  useEffect(() => {
    if (!open) return
    setCustomerId(initialOrder?.customerId)
    setOrderDate(initialOrder ? dayjs(initialOrder.orderDate) : dayjs())
    setCustomerPoNo(initialOrder?.customerPoNo ?? '')
    setExpectedOutboundDate(initialOrder?.expectedOutboundDate ? dayjs(initialOrder.expectedOutboundDate) : null)
    setSalesperson(initialOrder?.salesperson ?? '')
    setRemarks(initialOrder?.remarks ?? '')
    setSelectedProductId(undefined)
    setScanValue('')
    setLines(initialOrder?.lines ?? [])
  }, [initialOrder, open])

  const reset = () => {
    setCustomerId(undefined)
    setCustomerPoNo('')
    setExpectedOutboundDate(null)
    setSalesperson('')
    setRemarks('')
    setSelectedProductId(undefined)
    setOrderDate(dayjs())
    setScanValue('')
    setLines([])
  }

  const getPrice = async (product: Product, nextCustomerId = customerId, nextOrderDate = orderDate) => {
    if (!nextCustomerId) return product.unitPrice
    return (await resolveSalesPrice(nextCustomerId, product.id, nextOrderDate.format('YYYY-MM-DD'))).unitPrice
  }

  const addProduct = async (product: Product) => {
    const unitPrice = await getPrice(product)
    setLines(current => {
      const existing = current.find(line => line.productId === product.id)
      if (!existing) return [...current, productToLine(product, unitPrice)]
      return current.map(line => line.productId === product.id
        ? { ...line, quantity: line.quantity + 1, amount: (line.quantity + 1) * line.unitPrice }
        : line,
      )
    })
  }

  const handleScanOrCode = async () => {
    const value = scanValue.trim()
    if (!value || lookingUpProduct) return

    setLookingUpProduct(true)
    try {
      const normalized = value.toLowerCase()
      const product = products.find(item =>
        item.status === ProductStatus.Active &&
        (item.productCode.toLowerCase() === normalized || item.barcode?.toLowerCase() === normalized),
      )
      if (!product) {
        message.warning(`No active product matches "${value}".`)
        return
      }
      await addProduct(product)
      setScanValue('')
      message.success(`${product.name} added to the order`)
    } catch (error) {
      console.error(error)
      message.error('Unable to find the product. Please try again.')
    } finally {
      setLookingUpProduct(false)
    }
  }

  const handleManualProductAdd = async () => {
    const product = products.find(item => item.id === selectedProductId)
    if (!product) {
      message.warning('Select a product to add.')
      return
    }
    try { await addProduct(product) }
    catch (error) { console.error(error); message.error('Unable to load the sales price.') }
    setSelectedProductId(undefined)
  }

  const updateQuantity = (lineId: string, quantity: number | null) => {
    const nextQuantity = quantity && quantity > 0 ? quantity : 1
    setLines(current => current.map(line => line.id === lineId
      ? { ...line, quantity: nextQuantity, amount: nextQuantity * line.unitPrice }
      : line,
    ))
  }

  const updateUnitPrice = (lineId: string, unitPrice: number | null) => {
    const nextPrice = unitPrice ?? 0
    setLines(current => current.map(line => line.id === lineId ? { ...line, unitPrice: nextPrice, amount: nextPrice * line.quantity } : line))
  }

  const repriceLines = async (nextCustomerId: string | undefined, nextOrderDate: Dayjs) => {
    if (!nextCustomerId || lines.length === 0) return
    try {
      const nextLines = await Promise.all(lines.map(async line => {
        const product = products.find(item => item.id === line.productId)
        if (!product) return line
        const unitPrice = await getPrice(product, nextCustomerId, nextOrderDate)
        return { ...line, unitPrice, amount: unitPrice * line.quantity }
      }))
      setLines(nextLines)
    } catch (error) { console.error(error); message.error('Unable to refresh sales prices.') }
  }

  const totalAmount = useMemo(
    () => lines.reduce((total, line) => total + line.amount, 0),
    [lines],
  )

  const submit = async () => {
    if (!customerId) {
      message.warning('Select a customer before saving the order.')
      return
    }
    if (lines.length === 0) {
      message.warning('Scan a barcode or enter a product code to add an item.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        customerId,
        orderDate: orderDate.format('YYYY-MM-DD'),
        customerPoNo: customerPoNo.trim() || undefined,
        expectedOutboundDate: expectedOutboundDate?.format('YYYY-MM-DD'),
        salesperson: salesperson.trim() || undefined,
        remarks: remarks.trim() || undefined,
        lines,
      })
      reset()
    } finally {
      setSubmitting(false)
    }
  }

  const columns: ColumnsType<SalesOrderLine> = [
    {
      title: 'Product',
      render: (_value, line) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{line.productName}</Typography.Text>
          <Typography.Text type="secondary">{line.productCode}{line.specification ? ` · ${line.specification}` : ''}</Typography.Text>
        </Space>
      ),
    },
    { title: 'Unit', dataIndex: 'unit' },
    { title: 'Unit Price', dataIndex: 'unitPrice', render: (value, line) => <InputNumber min={0} precision={2} prefix="$" value={value} onChange={next => updateUnitPrice(line.id, next)} /> },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (quantity, line) => <InputNumber min={1} value={quantity} onChange={value => updateQuantity(line.id, value)} />,
    },
    { title: 'Amount', dataIndex: 'amount', render: value => `$${value.toLocaleString()}` },
    {
      title: 'Actions',
      render: (_value, line) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setLines(current => current.filter(item => item.id !== line.id))}>
          Remove
        </Button>
      ),
    },
  ]

  return (
    <Modal
      title={mode === 'create' ? 'New Sales Order' : `Edit Sales Order ${initialOrder?.orderNo}`}
      open={open}
      width={980}
      onCancel={() => !submitting && onCancel()}
      onOk={submit}
      okText={mode === 'create' ? 'Create Order' : 'Save Changes'}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap style={{ width: '100%' }}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select customer"
            loading={loadingCustomers}
            value={customerId}
            onChange={value => { setCustomerId(value); void repriceLines(value, orderDate) }}
            style={{ width: 300 }}
            options={customers.map(customer => ({ label: `${customer.customerCode} · ${customer.name}`, value: customer.id }))}
          />
          <DatePicker value={orderDate} onChange={value => { const next = value ?? dayjs(); setOrderDate(next); void repriceLines(customerId, next) }} />
          <Input
            placeholder="Customer PO No."
            value={customerPoNo}
            onChange={event => setCustomerPoNo(event.target.value)}
            style={{ width: 220 }}
            maxLength={100}
          />
          <DatePicker
            placeholder="Expected outbound date"
            value={expectedOutboundDate}
            onChange={setExpectedOutboundDate}
          />
          <Input
            placeholder="Salesperson"
            value={salesperson}
            onChange={event => setSalesperson(event.target.value)}
            style={{ width: 220 }}
            maxLength={100}
          />
        </Space>

        <Input.TextArea
          placeholder="Remarks"
          value={remarks}
          onChange={event => setRemarks(event.target.value)}
          maxLength={1000}
          autoSize={{ minRows: 2, maxRows: 4 }}
          showCount
        />

        <Input
          prefix={<ScanOutlined />}
          placeholder="Scan barcode or enter product code, then press Enter"
          value={scanValue}
          onChange={event => setScanValue(event.target.value)}
          onPressEnter={event => {
            event.preventDefault()
            handleScanOrCode()
          }}
          suffix={<Button type="link" loading={lookingUpProduct} onClick={handleScanOrCode}>Add</Button>}
        />

        <Space.Compact style={{ width: '100%' }}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Or select a product manually"
            value={selectedProductId}
            onChange={setSelectedProductId}
            style={{ width: '100%' }}
            options={products.map(product => ({
              label: `${product.productCode} · ${product.name}${product.specification ? ` · ${product.specification}` : ''}`,
              value: product.id,
            }))}
          />
          <Button onClick={() => { void handleManualProductAdd() }}>Add Product</Button>
        </Space.Compact>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={lines}
          pagination={false}
          locale={{ emptyText: 'Scan a barcode or enter a product code to add an item.' }}
        />
        <Typography.Text strong style={{ alignSelf: 'flex-end', fontSize: 16 }}>
          Total: ${totalAmount.toLocaleString()}
        </Typography.Text>
      </Space>
    </Modal>
  )
}

export default SalesOrderForm
