import { myFinancesApi } from '@/lib/axios'

interface ImportDebtCsvFileRequest {
  data: FormData
  periodId: string
}

export async function importDebtCsvFile({
  data,
  periodId,
}: ImportDebtCsvFileRequest) {
  await myFinancesApi.post(`periods/${periodId}/import-debits-by-csv`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
