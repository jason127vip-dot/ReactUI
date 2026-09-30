import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CreditCardOutlined,
  DollarOutlined,
  InboxOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Col, Empty, Flex, Row, Skeleton, Statistic, Table, Tag, Typography, theme } from 'antd'
import type { DashboardStats } from '../../services/analyticsApi'
import { getDashboardStats } from '../../services/analyticsApi'

type AntdToken = ReturnType<typeof theme.useToken>['token']

const formatCurrency = (value: number) => `$${value.toLocaleString('en-NZ', { maximumFractionDigits: 2 })}`

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')

const DailyOrderVolumeChart = ({
  data,
  token,
}: {
  data: DashboardStats['dailyOrderVolume']
  token: AntdToken
}) => {
  if (data.length === 0) {
    return <Empty description="No order volume data yet." style={{ padding: '64px 0' }} />
  }

  const width = 960
  const height = 260
  const padding = { top: 28, right: 24, bottom: 42, left: 46 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxCount = Math.max(...data.map(item => item.count), 1)
  const chartMax = maxCount <= 4 ? 4 : Math.ceil(maxCount / 4) * 4
  const points = data.map((item, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth
    const y = padding.top + (1 - item.count / chartMax) * plotHeight
    return { ...item, x, y }
  })
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  const lastPoint = points[points.length - 1]
  const areaPath = `${linePath} L ${lastPoint.x} ${padding.top + plotHeight} L ${padding.left} ${padding.top + plotHeight} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Daily sales order volume over the last fourteen days"
      style={{ width: '100%', minWidth: 640, height: 'auto', display: 'block' }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padding.top + ratio * plotHeight
        const value = Math.round(chartMax * (1 - ratio))

        return (
          <g key={ratio}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke={token.colorSplit} strokeDasharray="4 4" />
            <text x={padding.left - 12} y={y + 4} textAnchor="end" fill={token.colorTextSecondary} fontSize="12">
              {value}
            </text>
          </g>
        )
      })}
      <path d={areaPath} fill={token.colorPrimaryBg} opacity={0.8} />
      <path d={linePath} fill="none" stroke={token.colorPrimary} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => (
        <g key={point.date}>
          <title>{`${point.date}: ${point.count} order${point.count === 1 ? '' : 's'}`}</title>
          <circle cx={point.x} cy={point.y} r={4} fill={token.colorBgContainer} stroke={token.colorPrimary} strokeWidth={2} />
          {point.count > 0 && (
            <text x={point.x} y={point.y - 11} textAnchor="middle" fill={token.colorText} fontSize="12" fontWeight={600}>
              {point.count}
            </text>
          )}
          {(index % 2 === 0 || index === points.length - 1) && (
            <text x={point.x} y={height - 13} textAnchor="middle" fill={token.colorTextSecondary} fontSize="12">
              {point.date.slice(5).replace('-', '/')}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const { token } = theme.useToken()

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const nextStats = await getDashboardStats()
      setStats(nextStats)
    } catch (loadError) {
      console.error(loadError)
      setError('Failed to load dashboard metrics. Check the data source and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
    const timer = setInterval(loadStats, 1000 * 60 * 5)
    return () => clearInterval(timer)
  }, [loadStats])

  const metricCards = useMemo(() => ([
    {
      title: 'Total Sales',
      value: stats?.totalSales ?? 0,
      prefix: '$',
      icon: <ShoppingCartOutlined />,
      color: token.colorInfo,
      background: token.colorInfoBg,
      description: 'Confirmed sales orders',
    },
    {
      title: 'Received Amount',
      value: stats?.receivedAmount ?? 0,
      prefix: '$',
      icon: <DollarOutlined />,
      color: token.colorSuccess,
      background: token.colorSuccessBg,
      description: 'Confirmed customer payments',
    },
    {
      title: 'Unpaid Amount',
      value: stats?.unpaidAmount ?? 0,
      prefix: '$',
      icon: <CreditCardOutlined />,
      color: token.colorWarning,
      background: token.colorWarningBg,
      description: 'Outstanding order balance',
    },
    {
      title: 'Outbound Quantity',
      value: stats?.outboundQuantity ?? 0,
      suffix: 'items',
      icon: <InboxOutlined />,
      color: token.colorPrimary,
      background: token.colorPrimaryBg,
      description: 'Confirmed outbound items',
    },
  ]), [stats, token])

  if (loading && !stats) {
    return <Skeleton active paragraph={{ rows: 12 }} />
  }

  const recentSalesOrders = stats?.recentSalesOrders ?? []
  const outstandingCustomers = stats?.outstandingCustomers ?? []
  const dailyOrderVolume = stats?.dailyOrderVolume ?? []

  return (
    <Flex vertical gap="large" style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap gap="small">
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>Sales Overview</Typography.Title>
          <Typography.Text type="secondary">Monitor orders, outbound activity and customer payments.</Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={loadStats}>Refresh</Button>
      </Flex>

      {error && <Alert type="error" showIcon message={error} />}

      <Row gutter={[16, 16]}>
        {metricCards.map(card => (
          <Col key={card.title} xs={24} sm={12} xl={6}>
            <Card styles={{ body: { padding: 20 } }} style={{ height: '100%' }}>
              <Flex align="flex-start" gap="middle">
                <Flex
                  align="center"
                  justify="center"
                  style={{ width: 40, height: 40, flex: '0 0 40px', borderRadius: 10, color: card.color, background: card.background, fontSize: 18 }}
                >
                  {card.icon}
                </Flex>
                <div style={{ minWidth: 0 }}>
                  <Typography.Text type="secondary">{card.title}</Typography.Text>
                  <Statistic
                    value={card.value}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    precision={0}
                    valueStyle={{ color: token.colorText, fontSize: 26, lineHeight: 1.35 }}
                  />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>{card.description}</Typography.Text>
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Daily Order Volume" extra={<Typography.Text type="secondary">Last 14 days</Typography.Text>} styles={{ body: { overflowX: 'auto' } }}>
        <DailyOrderVolumeChart data={dailyOrderVolume} token={token} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card title="Recent Sales Orders" styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={recentSalesOrders}
              locale={{ emptyText: 'No sales orders yet.' }}
              columns={[
                { title: 'Order No.', dataIndex: 'orderNo' },
                { title: 'Customer', dataIndex: 'customerName' },
                { title: 'Order Date', dataIndex: 'orderDate', width: 120 },
                { title: 'Amount', dataIndex: 'amount', width: 120, align: 'right', render: value => formatCurrency(value) },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  width: 110,
                  render: status => <Tag color={status === 'confirmed' ? 'processing' : 'default'}>{formatStatus(status)}</Tag>,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card title="Outstanding Customers" styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="name"
              size="small"
              pagination={false}
              dataSource={outstandingCustomers}
              locale={{ emptyText: 'No outstanding customers.' }}
              columns={[
                { title: 'Customer', dataIndex: 'name' },
                {
                  title: 'Outstanding',
                  dataIndex: 'amount',
                  width: 140,
                  align: 'right',
                  render: value => <Typography.Text strong style={{ color: token.colorWarning }}>{formatCurrency(value)}</Typography.Text>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Flex>
  )
}

export default DashboardPage
