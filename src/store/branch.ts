import { create } from 'zustand'
import { request } from '../utils/api'

export type Branch = { id: number; code: string; name: string; enableCreditControl: boolean; totalCreditLimit: number }
type BranchState = {
  branches: Branch[]
  branchId?: number
  ready: boolean
  error?: string
  load: () => Promise<void>
  select: (id: number) => void
}

const useBranchStore = create<BranchState>((set) => ({
  branches: [],
  ready: false,
  load: async () => {
    set({ ready: false, error: undefined })
    try {
      const { data } = await request.get<{ data: Branch[] }>('/branches')
      const saved = Number(localStorage.getItem('branchId'))
      const branchId = data.find(branch => branch.id === saved)?.id ?? data[0]?.id
      if (!branchId) throw new Error('No branches available. Please contact your administrator.')
      localStorage.setItem('branchId', String(branchId))
      set({ branches: data, branchId, ready: true })
    } catch (error) {
      set({ error: error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unable to load branches.' })
    }
  },
  select: (branchId) => {
    localStorage.setItem('branchId', String(branchId))
    set({ branchId })
  },
}))

export default useBranchStore
