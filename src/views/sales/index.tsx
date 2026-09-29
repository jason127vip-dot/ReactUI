import { Card, Empty } from 'antd'

interface PlaceholderPageProps {
  title: string
}

const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <Card title={title}>
    <Empty description="This page will be available soon." />
  </Card>
)

export default PlaceholderPage