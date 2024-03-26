import { compareDesc } from 'date-fns'
import { cookies } from 'next/headers'
import { cache, Suspense } from 'react'

import { fetchUserPeriods } from '@/api/fetch-user-periods'
import { PaymentTable } from '@/components/payment-table'

const loadData = cache(async () => {
  const response = await fetchUserPeriods(cookies().toString())

  return response.sort((a, b) => compareDesc(a.createdAt, b.createdAt))
})

export default async function Payments() {
  const periods = await loadData()

  return (
    <div className="container flex flex-1 items-center justify-center ">
      <Suspense>
        <PaymentTable periods={periods} />
      </Suspense>
    </div>
  )
}
