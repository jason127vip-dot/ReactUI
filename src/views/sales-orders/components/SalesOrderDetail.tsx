import { Descriptions, Drawer, Table, Tag, Typography } from 'antd'
import { SalesOrder, SalesOrderStatus } from '../types'

interface SalesOrderDetailProps {
  order?: SalesOrder
  open: boolean
  onClose: () => void
}

const statusColorMap: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.Draft]: 'default',
  [SalesOrderStatus.Confirmed]: 'processing',
}

const executionStatusLabel = (status?: string) => status
  ? status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  : '-'

const SalesOrderDetail = ({ order, open, onClose }: SalesOrderDetailProps) => (
  <Drawer
    width={760}
    title={order ? `Sales Order ${order.orderNo}` : 'Sales Order Details'}
    open={open}
    onClose={onClose}
    destroyOnClose
    extra={order && <Tag color={statusColorMap[order.status]}>{order.status}</Tag>}
  >
    {order ? (
      <>
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Order No.">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="Order Date">{order.orderDate}</Descriptions.Item>
          <Descriptions.Item label="Customer">{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">${order.totalAmount.toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Customer PO No.">{order.customerPoNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="Expected Outbound Date">{order.expectedOutboundDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="Salesperson">{order.salesperson || '-'}</Descriptions.Item>
          <Descriptions.Item label="Total Quantity">{order.totalQuantity ?? order.lines.reduce((sum, line) => sum + line.quantity, 0)}</Descriptions.Item>
          <Descriptions.Item label="Outbound Status">
            <Tag color={order.outboundStatus === 'fully_outbound' ? 'success' : order.outboundStatus === 'partially_outbound' ? 'warning' : 'default'}>
              {executionStatusLabel(order.outboundStatus)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Payment Status">
            <Tag color={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'partially_paid' ? 'warning' : 'default'}>
              {executionStatusLabel(order.paymentStatus)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Paid Amount">${(order.paidAmount ?? 0).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Unpaid Amount">${(order.unpaidAmount ?? order.totalAmount).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Remarks" span={2}>{order.remarks || '-'}</Descriptions.Item>
        </Descriptions>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={order.lines}
          columns={[
            { title: 'Product Code', dataIndex: 'productCode' },
            { title: 'Product Name', dataIndex: 'productName' },
            { title: 'Unit', dataIndex: 'unit' },
            { title: 'Unit Price', dataIndex: 'unitPrice', render: value => `$${value.toLocaleString()}` },
            { title: 'Quantity', dataIndex: 'quantity' },
            { title: 'Amount', dataIndex: 'amount', render: value => `$${value.toLocaleString()}` },
          ]}
        />
      </>
    ) : (
      <Typography.Text type="secondary">Select an order to view details.</Typography.Text>
    )}
  </Drawer>
)

export default SalesOrderDetail
