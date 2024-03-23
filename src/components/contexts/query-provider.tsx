'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'

import { isUnauthorizedError, myFinancesApi } from '@/lib/axios'
import { queryClient } from '@/lib/react-query'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const { replace } = useRouter()

  useEffect(() => {
    const interceptorId = myFinancesApi.interceptors.response.use(
      (response) => response,
      (error) => {
        const canRedirectToLogin = isUnauthorizedError(error)

        if (canRedirectToLogin) {
          replace('/sign-in')
        }

        return Promise.reject(error)
      },
    )

    return () => {
      myFinancesApi.interceptors.response.eject(interceptorId)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  )
}
