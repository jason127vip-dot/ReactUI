import { useEffect, useState } from 'react'
import { Alert, Button, Card, Descriptions, Empty, Input, List, Modal, Space, Spin, Table, Tag, Typography } from 'antd'
import { RobotOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { reviewSalesOrder, type AIReviewMessage, type AIReviewResult, type ReviewInvoice } from '../../../services/aiReviewApi'
import type { SalesOrder } from '../types'

interface SalesOrderAIReviewProps {
  order?: SalesOrder
  open: boolean
  onClose: () => void
}

const money = (value: number) => `$${value.toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const riskColors: Record<AIReviewResult['assessment']['riskLevel'], string> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
  informational: 'processing',
}

const invoiceColumns: ColumnsType<ReviewInvoice> = [
  { title: 'Invoice', dataIndex: 'invoiceNo' },
  { title: 'Age', dataIndex: 'agingDays', width: 80, render: value => `${value} days` },
  { title: 'Outstanding', dataIndex: 'outstandingAmount', align: 'right', width: 130, render: money },
]

const SalesOrderAIReview = ({ order, open, onClose }: SalesOrderAIReviewProps) => {
  const [review, setReview] = useState<AIReviewResult>()
  const [messages, setMessages] = useState<AIReviewMessage[]>([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!open || !order) return
    let active = true
    setReview(undefined)
    setMessages([])
    setQuestion('')
    setError(undefined)
    setLoading(true)
    reviewSalesOrder(order.id)
      .then(result => { if (active) setReview(result) })
      .catch(loadError => { if (active) setError(loadError && typeof loadError === 'object' && 'message' in loadError ? String(loadError.message) : 'Unable to load the AI order review.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [open, order])

  const ask = async (value: string) => {
    const nextQuestion = value.trim()
    if (!order || !nextQuestion || sending) return
    const history = messages
    setQuestion('')
    setSending(true)
    setError(undefined)
    try {
      const nextReview = await reviewSalesOrder(order.id, nextQuestion, history)
      setReview(nextReview)
      setMessages([...history, { role: 'user', content: nextQuestion }, { role: 'assistant', content: nextReview.ai.answer }])
    } catch (askError) {
      setError(askError && typeof askError === 'object' && 'message' in askError ? String(askError.message) : 'Unable to send the question.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal
      width={760}
      title={<Space><RobotOutlined /><span>AI Order Review</span></Space>}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnHidden
      styles={{ body: { maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' } }}
    >
      {loading && <div style={{ display: 'grid', placeItems: 'center', minHeight: 300 }}><Spin size="large" /></div>}
      {!loading && error && !review && <Alert type="error" showIcon message={error} />}
      {!loading && !error && !review && <Empty description="No review available." />}
      {review && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {review.source === 'mock' && (
            <Alert
              type={review.aiUnavailable ? 'warning' : 'info'}
              showIcon
              message={review.aiUnavailable ? 'OpenAI is unavailable. Showing a locally generated review.' : 'Demo mode: showing a locally generated AI review.'}
            />
          )}

          <Card size="small">
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Space wrap>
                <Tag color={riskColors[review.assessment.riskLevel]}>{review.assessment.riskLevel.toUpperCase()}</Tag>
                <Typography.Text strong>{review.order.orderNo}</Typography.Text>
              </Space>
              <Typography.Text>{review.order.customerCode} · {review.order.customerName}</Typography.Text>
              <Typography.Text type="secondary">{review.ai.summary}</Typography.Text>
            </Space>
          </Card>

          <Descriptions bordered size="small" column={2} title="Credit Position">
            <Descriptions.Item label="Order Amount">{money(review.order.orderAmount)}</Descriptions.Item>
            <Descriptions.Item label="Credit Limit">{review.credit.configured ? money(review.credit.creditLimit) : 'Not configured'}</Descriptions.Item>
            <Descriptions.Item label="Used Credit">{money(review.credit.usedCredit)}</Descriptions.Item>
            <Descriptions.Item label="Available Credit">{money(review.credit.availableCredit)}</Descriptions.Item>
            <Descriptions.Item label="Projected Exposure">{money(review.credit.projectedExposure)}</Descriptions.Item>
            <Descriptions.Item label="Credit Rule">
              <Tag color={review.assessment.canConfirmUnderCreditRule ? 'success' : 'error'}>
                {review.assessment.canConfirmUnderCreditRule ? 'Pass' : 'Blocked'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Card size="small" title="Why this result">
            <List
              size="small"
              dataSource={review.assessment.reasons}
              renderItem={reason => <List.Item>{reason}</List.Item>}
            />
          </Card>

          <Card size="small" title="Outstanding Invoices" extra={<Typography.Text type="secondary">Total {money(review.aging.outstandingAmount)}</Typography.Text>}>
            <Table
              rowKey="invoiceNo"
              size="small"
              columns={invoiceColumns}
              dataSource={review.aging.invoices}
              pagination={false}
              locale={{ emptyText: 'No outstanding confirmed invoices.' }}
            />
          </Card>

          <Alert type="info" showIcon message="Recommendation" description={review.ai.recommendation} />

          {messages.length > 0 && (
            <Card size="small" title="Conversation">
              <List
                size="small"
                dataSource={messages}
                renderItem={item => (
                  <List.Item>
                    <Space direction="vertical" size={0}>
                      <Typography.Text strong>{item.role === 'user' ? 'You' : 'AI Assistant'}</Typography.Text>
                      <Typography.Text>{item.content}</Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Space wrap>
            {review.ai.suggestedQuestions.slice(0, 3).map(item => (
              <Button key={item} size="small" onClick={() => { void ask(item) }} disabled={sending}>{item}</Button>
            ))}
          </Space>
          <Input.Search
            value={question}
            onChange={event => setQuestion(event.target.value)}
            onSearch={value => { void ask(value) }}
            placeholder="Ask about this order's credit position..."
            enterButton="Send"
            loading={sending}
            maxLength={2000}
          />
          {error && <Alert type="error" showIcon message={error} />}
        </Space>
      )}
    </Modal>
  )
}

export default SalesOrderAIReview
