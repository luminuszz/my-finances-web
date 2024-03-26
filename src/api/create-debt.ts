import { myFinancesApi } from '@/lib/axios'

interface CreateDebtRequest {
  description: string
  amount: number
  paymentPeriodId: string
}

export async function createDebt({
  amount,
  description,
  paymentPeriodId,
}: CreateDebtRequest) {
  await myFinancesApi.post(`/periods/${paymentPeriodId}/create-debit`, {
    amount,
    description,
    expiresAt: null,
  })
}
