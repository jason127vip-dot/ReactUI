import { Descriptions, Drawer, Tag, Typography } from 'antd'
import { Customer, CustomerStatus } from '../types'

interface CustomerDetailProps {
  customer?: Customer
  open: boolean
  onClose: () => void
}

const statusColorMap: Record<CustomerStatus, string> = {
  [CustomerStatus.Active]: 'success',
  [CustomerStatus.Inactive]: 'default',
  [CustomerStatus.Prospect]: 'default',
  [CustomerStatus.InProgress]: 'processing',
  [CustomerStatus.Churned]: 'error',
}

const CustomerDetail = ({ customer, open, onClose }: CustomerDetailProps) => (
  <Drawer
    width={420}
    title={customer?.name ?? 'Customer Details'}
    open={open}
    onClose={onClose}
    destroyOnClose
    extra={customer && <Tag color={statusColorMap[customer.status]}>{customer.status}</Tag>}
  >
    {customer ? (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Customer Code">{customer.customerCode}</Descriptions.Item>
        <Descriptions.Item label="Customer Name">{customer.name}</Descriptions.Item>
        <Descriptions.Item label="Contact Person">{customer.contactPerson}</Descriptions.Item>
        <Descriptions.Item label="Phone">{customer.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Address">{customer.address || '-'}</Descriptions.Item>
        <Descriptions.Item label="Payment Terms">{customer.paymentTerms || '-'}</Descriptions.Item>
        <Descriptions.Item label="Notes">{customer.notes || '-'}</Descriptions.Item>
        <Descriptions.Item label="Created At">
          {new Date(customer.createdAt).toLocaleString()}
        </Descriptions.Item>
        {customer.updatedAt && (
          <Descriptions.Item label="Last Updated">
            {new Date(customer.updatedAt).toLocaleString()}
          </Descriptions.Item>
        )}
      </Descriptions>
    ) : (
      <Typography.Text type="secondary">Select a customer to view details.</Typography.Text>
    )}
  </Drawer>
)

export default CustomerDetail
