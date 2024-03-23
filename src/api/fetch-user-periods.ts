import { myFinancesApi, setCookies } from '@/lib/axios'

export interface Period {
  userId: string
  id: string
  startPeriod: Date
  endPeriod: Date
  createdAt: Date
  updatedAt: Date
}

export async function fetchUserPeriods(cookies?: string) {
  if (cookies) {
    setCookies(myFinancesApi.defaults.headers, cookies)
  }

  const response = await myFinancesApi.get<Period[]>('/periods')

  return response.data
}
