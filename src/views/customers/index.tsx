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
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Customer, CustomerFilters, CustomerStatus } from './types'
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../../services/masterDataApi'
import CustomerForm from './components/CustomerForm'
import CustomerDetail from './components/CustomerDetail'

const statusOptions = [
  { label: 'Active', value: CustomerStatus.Active },
  { label: 'Inactive', value: CustomerStatus.Inactive },
]

const statusColorMap: Record<CustomerStatus, string> = {
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'default',
  [CustomerStatus.Prospect]: 'default',
  [CustomerStatus.InProgress]: 'processing',
  [CustomerStatus.Churned]: 'error',
}

const CustomersPage = () => {
  const [filterForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filters, setFilters] = useState<CustomerFilters>({})
  const [formVisible, setFormVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>()
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [error, setError] = useState<string>()

  const loadCustomers = async () => {
    setLoading(true)
    setError(undefined)
    try {
      setCustomers(await getCustomers())
    } catch (loadError) {
      console.error(loadError)
      setError('Failed to load customers. Check the data source and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filteredCustomers = useMemo(() => customers.filter(customer => {
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const matches = [customer.customerCode, customer.name, customer.contactPerson, customer.phone, customer.email]
        .some(value => value?.toLowerCase().includes(keyword))
      if (!matches) return false
    }
    return !filters.status?.length || filters.status.includes(customer.status)
  }), [customers, filters])

  const openCreateForm = () => {
    setFormMode('create')
    setSelectedCustomer(undefined)
    setFormVisible(true)
  }

  const resetFilters = () => {
    filterForm.resetFields()
    setFilters({})
  }

  const handleDelete = async (record: Customer) => {
    try {
      await deleteCustomer(record.id)
      message.success('Customer deleted')
      await loadCustomers()
    } catch (deleteError) {
      console.error(deleteError)
      message.error('Failed to delete customer. Please try again later.')
    }
  }

  const columns: ColumnsType<Customer> = [
    {
      title: 'Customer Code',
      dataIndex: 'customerCode',
    },
    {
      title: 'Customer Name',
      dataIndex: 'name',
    },
    {
      title: 'Contact Person',
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.contactPerson}</Typography.Text>
          <Typography.Text type="secondary">{record.phone || record.email || '-'}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: value => value || '-',
    },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      render: value => value || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: CustomerStatus) => <Tag color={statusColorMap[status]}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_value, record) => (
        <Space>
          <Button type="link" onClick={() => {
            setSelectedCustomer(record)
            setDetailVisible(true)
          }}>
            View
          </Button>
          <Button type="link" onClick={() => {
            setSelectedCustomer(record)
            setFormMode('edit')
            setFormVisible(true)
          }}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this customer?"
            description="This customer will no longer be available for new sales orders."
            okText="Delete customer"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
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
            <Input allowClear placeholder="Code, name, contact, phone or email" style={{ width: 260 }} />
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

      <Card
        title="Customer Master"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Customer</Button>}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              action={<Button size="small" icon={<ReloadOutlined />} onClick={loadCustomers}>Retry</Button>}
            />
          )}
          <Table
            rowKey="id"
            loading={loading}
            dataSource={filteredCustomers}
            columns={columns}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{
              emptyText: (
                <Empty description="No customers found.">
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>New Customer</Button>
                </Empty>
              ),
            }}
          />
        </Space>
      </Card>

      {formVisible && (
        <CustomerForm
          mode={formMode}
          open={formVisible}
          initialValues={selectedCustomer}
          onCancel={() => setFormVisible(false)}
          onSubmit={async values => {
            try {
              if (formMode === 'create') {
                await createCustomer(values)
                message.success('Customer created successfully')
              } else if (selectedCustomer) {
                await updateCustomer(selectedCustomer.id, values)
                message.success('Customer updated')
              }
              setFormVisible(false)
              await loadCustomers()
            } catch (saveError) {
              console.error(saveError)
              message.error('Failed to save customer. Please try again later.')
            }
          }}
        />
      )}

      <CustomerDetail customer={selectedCustomer} open={detailVisible} onClose={() => setDetailVisible(false)} />
    </Space>
  )
}

export default CustomersPage
