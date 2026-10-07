import { request } from '../utils/api'

type ApiResponse<T> = { code: number; message: string; data: T }

export type AIReviewMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ReviewInvoice = {
  invoiceNo: string
  invoiceDate: string
  outstandingAmount: number
  agingDays: number
  agingBucket: string
}

export type AIReviewResult = {
  order: {
    orderNo: string
    customerCode: string
    customerName: string
    orderAmount: number
  }
  credit: {
    controlEnabled: boolean
    configured: boolean
    creditLimit: number
    usedCredit: number
    availableCredit: number
    projectedExposure: number
    exceededAmount: number
  }
  aging: {
    outstandingAmount: number
    olderThan30DaysAmount: number
    olderThan30DaysCount: number
    oldestAgingDays: number
    invoices: ReviewInvoice[]
  }
  assessment: {
    riskLevel: 'high' | 'medium' | 'low' | 'informational'
    creditStatus: 'over_limit' | 'within_limit' | 'control_disabled'
    canConfirmUnderCreditRule: boolean
    reasons: string[]
  }
  ai: {
    summary: string
    answer: string
    recommendation: string
    suggestedQuestions: string[]
  }
  source: 'mock' | 'openai'
  aiUnavailable: boolean
}

export const reviewSalesOrder = async (id: string, question = '', history: AIReviewMessage[] = []) => {
  const response = await request.post<ApiResponse<AIReviewResult>>(`/sales-orders/${id}/ai-review`, { question, history }, { timeout: 20000 })
  return response.data
}
