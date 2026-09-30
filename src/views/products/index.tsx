import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../services/masterDataApi'
import ProductDetail from './components/ProductDetail'
import ProductForm from './components/ProductForm'
import { Product, ProductFilters, ProductStatus } from './types'

const statusOptions = [
  { label: 'Active', value: ProductStatus.Active },
  { label: 'Inactive', value: ProductStatus.Inactive },
]

const statusColorMap: Record<ProductStatus, string> = {
  [ProductStatus.Active]: 'success',
  [ProductStatus.Inactive]: 'default',
}

const ProductsPage = () => {
  const [filterForm] = Form.useForm()
  const [products, setProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<ProductFilters>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [formVisible, setFormVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product>()
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')

  const loadProducts = async () => {
    setLoading(true)
    setError(undefined)
    try {
      setProducts(await getProducts())
    } catch (loadError) {
      console.error(loadError)
      setError('Failed to load products. Check the data source and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => products.filter(product => {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const matches = [product.productCode, product.barcode, product.name, product.specification, product.unit]
        .some(value => value?.toLowerCase().includes(keyword))
      if (!matches) return false
    }
    return !filters.status?.length || filters.status.includes(product.status)
  }), [products, filters])

  const resetFilters = () => {
    filterForm.resetFields()
    setFilters({})
  }

  const openCreateForm = () => {
    setFormMode('create')
    setSelectedProduct(undefined)
    setFormVisible(true)
  }

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id)
      message.success('Product deleted')
      await loadProducts()
    } catch (deleteError) {
      console.error(deleteError)
      message.error('Failed to delete product. Please try again later.')
    }
  }

  const columns: ColumnsType<Product> = [
    { title: 'Product Code', dataIndex: 'productCode' },
    { title: 'Barcode', dataIndex: 'barcode', render: value => value || '-' },
    { title: 'Product Name', dataIndex: 'name' },
    { title: 'Specification', dataIndex: 'specification', render: value => value || '-' },
    { title: 'Unit', dataIndex: 'unit' },
    { title: 'Unit Price', dataIndex: 'unitPrice', render: value => `$${value.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', render: (status: ProductStatus) => <Tag color={statusColorMap[status]}>{status}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_value, product) => (
        <Space>
          <Button type="link" onClick={() => {
            setSelectedProduct(product)
            setDetailVisible(true)
          }}>
            View
          </Button>
          <Button type="link" onClick={() => {
            setSelectedProduct(product)
            setFormMode('edit')
            setFormVisible(true)
          }}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            description="This product will no longer be available for new sales orders."
            okText="Delete product"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(product)}
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Form
          form={filterForm}
          layout="inline"
          style={{ rowGap: 16, columnGap: 16, width: '100%' }}
          onFinish={values => setFilters({ keyword: values.keyword, status: values.status })}
        >
          <Form.Item name="keyword" label="Keyword">
            <Input allowClear placeholder="Code, name, specification or unit" style={{ width: 260 }} />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select mode="multiple" allowClear placeholder="Select statuses" options={statusOptions} style={{ minWidth: 180 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Search</Button>
              <Button onClick={resetFilters}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Product Master" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Product</Button>}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              action={<Button size="small" icon={<ReloadOutlined />} onClick={loadProducts}>Retry</Button>}
            />
          )}
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filteredProducts}
            columns={columns}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{
              emptyText: (
                <Empty description="No products found.">
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Product</Button>
                </Empty>
              ),
            }}
          />
        </Space>
      </Card>

      {formVisible && (
        <ProductForm
          mode={formMode}
          open={formVisible}
          initialValues={selectedProduct}
          onCancel={() => setFormVisible(false)}
          onSubmit={async values => {
            try {
              if (formMode === 'create') {
                await createProduct(values)
                message.success('Product created successfully')
              } else if (selectedProduct) {
                await updateProduct(selectedProduct.id, values)
                message.success('Product updated')
              }
              setFormVisible(false)
              await loadProducts()
            } catch (saveError) {
              console.error(saveError)
              message.error('Failed to save product. Please try again later.')
            }
          }}
        />
      )}

      <ProductDetail product={selectedProduct} open={detailVisible} onClose={() => setDetailVisible(false)} />
    </Space>
  )
}

export default ProductsPage
