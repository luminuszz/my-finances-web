'use client'

import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export function LoginButton() {
  const { status } = useSession()

  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/payments')
    }
  }, [status])

  return (
    <Button size="lg" onClick={() => signIn()}>
      Sign in
    </Button>
  )
}
