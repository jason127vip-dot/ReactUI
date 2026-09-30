import { Descriptions, Drawer, Table, Tag, Typography } from 'antd'
import { SalesOutbound, SalesOutboundStatus } from '../types'

interface SalesOutboundDetailProps {
  outbound?: SalesOutbound
  open: boolean
  onClose: () => void
}

const statusColorMap: Record<SalesOutboundStatus, string> = {
  [SalesOutboundStatus.Draft]: 'default',
  [SalesOutboundStatus.Confirmed]: 'processing',
}

const SalesOutboundDetail = ({ outbound, open, onClose }: SalesOutboundDetailProps) => (
  <Drawer
    width="min(760px, 100vw)"
    title={outbound ? `Sales Outbound ${outbound.outboundNo}` : 'Sales Outbound Details'}
    open={open}
    onClose={onClose}
    destroyOnHidden
    extra={outbound && <Tag color={statusColorMap[outbound.status]}>{outbound.status}</Tag>}
  >
    {outbound ? (
      <>
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Outbound No.">{outbound.outboundNo}</Descriptions.Item>
          <Descriptions.Item label="Outbound Date">{outbound.outboundDate}</Descriptions.Item>
          <Descriptions.Item label="Sales Order">{outbound.orderNo}</Descriptions.Item>
          <Descriptions.Item label="Customer">{outbound.customerName}</Descriptions.Item>
          <Descriptions.Item label="Total Quantity" span={2}>
            {outbound.lines.reduce((total, line) => total + line.outboundQuantity, 0)}
          </Descriptions.Item>
        </Descriptions>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={outbound.lines}
          scroll={{ x: 620 }}
          columns={[
            { title: 'Product Code', dataIndex: 'productCode' },
            { title: 'Product Name', dataIndex: 'productName' },
            { title: 'Unit', dataIndex: 'unit' },
            { title: 'Ordered Qty', dataIndex: 'orderedQuantity' },
            { title: 'Outbound Qty', dataIndex: 'outboundQuantity' },
          ]}
        />
      </>
    ) : (
      <Typography.Text type="secondary">Select a sales outbound to view details.</Typography.Text>
    )}
  </Drawer>
)

export default SalesOutboundDetail
