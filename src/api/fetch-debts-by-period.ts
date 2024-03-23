import { myFinancesApi } from '@/lib/axios'

export interface Debit {
  status: 'pending' | 'paid'
  id: string
  createdAt: Date
  updatedAt: Date
  description: string
  periodId: string | null
  amount: number
  expiresAt: Date | null
}

export async function fetchDebtsByPeriod(periodId: string) {
  const response = await myFinancesApi.get<{ debts: Debit[] }>(
    `/periods/${periodId}/debits`,
  )

  return response.data.debts
}
