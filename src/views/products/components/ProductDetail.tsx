import { Descriptions, Drawer, Tag, Typography } from 'antd'
import { Product, ProductStatus } from '../types'

interface ProductDetailProps {
  product?: Product
  open: boolean
  onClose: () => void
}

const statusColorMap: Record<ProductStatus, string> = {
  [ProductStatus.Active]: 'success',
  [ProductStatus.Inactive]: 'default',
}

const ProductDetail = ({ product, open, onClose }: ProductDetailProps) => (
  <Drawer
    width={420}
    title={product?.name ?? 'Product Details'}
    open={open}
    onClose={onClose}
    destroyOnClose
    extra={product && <Tag color={statusColorMap[product.status]}>{product.status}</Tag>}
  >
    {product ? (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Product Code">{product.productCode}</Descriptions.Item>
        <Descriptions.Item label="Barcode">{product.barcode || '-'}</Descriptions.Item>
        <Descriptions.Item label="Product Name">{product.name}</Descriptions.Item>
        <Descriptions.Item label="Specification">{product.specification || '-'}</Descriptions.Item>
        <Descriptions.Item label="Unit">{product.unit}</Descriptions.Item>
        <Descriptions.Item label="Unit Price">${product.unitPrice.toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Created At">{new Date(product.createdAt).toLocaleString()}</Descriptions.Item>
        {product.updatedAt && (
          <Descriptions.Item label="Last Updated">{new Date(product.updatedAt).toLocaleString()}</Descriptions.Item>
        )}
      </Descriptions>
    ) : (
      <Typography.Text type="secondary">Select a product to view details.</Typography.Text>
    )}
  </Drawer>
)

export default ProductDetail
