import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

import { Debit } from '@/api/fetch-debts-by-period'
import { periodIdAtom } from '@/store/table'

export function useDebitCache() {
  const queryClient = useQueryClient()
  const currentPeriodId = useAtomValue(periodIdAtom)
  const currentQueryKey = ['debts', { period: currentPeriodId }]

  const oldCache = queryClient.getQueryData<Debit[]>(currentQueryKey)

  function updateCache(debitId: string, data: Partial<Omit<Debit, 'id'>>) {
    const cache = queryClient.getQueryData<Debit[]>(currentQueryKey)

    queryClient.setQueryData(currentQueryKey, () => {
      return cache?.map((item) => {
        if (item.id === debitId) {
          return {
            ...item,
            ...data,
          }
        }

        return item
      })
    })

    return cache
  }

  function revertCache() {
    queryClient.setQueryData(currentQueryKey, oldCache)
  }

  return {
    updateCache,
    revertCache,
  }
}
