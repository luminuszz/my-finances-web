import { myFinancesApi } from '@/lib/axios'

type UpdateDebit = Partial<{
  amount: number
  description: string
  status: 'pending' | 'paid'
}>

export async function updateDebit(debtId: string, data: UpdateDebit) {
  await myFinancesApi.put(`/debts/${debtId}`, data)
}
