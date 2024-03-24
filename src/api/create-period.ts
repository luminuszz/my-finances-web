import { myFinancesApi } from '@/lib/axios'

interface CreatePeriodDialogProps {
  startPeriod: string
  endPeriod: string
}

export async function createPeriod({
  startPeriod,
  endPeriod,
}: CreatePeriodDialogProps) {
  await myFinancesApi.post('/periods', {
    startPeriod,
    endPeriod,
  })
}
