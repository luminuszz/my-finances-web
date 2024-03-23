import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { useEffect, useState } from 'react'

type UpdateStateCallBack = (parmas: URLSearchParams) => URLSearchParams

type HookReturn = [
  ReadonlyURLSearchParams,
  (callback: UpdateStateCallBack) => void,
]

export function useQueryString(): HookReturn {
  const router = useRouter()
  const currentPathName = usePathname()
  const currentSearchParams = useSearchParams()

  const [queryString, setQueryString] = useState(currentSearchParams.toString())

  const setParams = (callback: UpdateStateCallBack) => {
    setQueryString((prev) => {
      const newValue = callback(new URLSearchParams(prev))

      return newValue.toString()
    })
  }

  useEffect(() => {
    const newSearchParams = new URLSearchParams(queryString.toString())

    router.push(`${currentPathName}?${newSearchParams.toString()}`)
  }, [queryString])

  return [currentSearchParams, setParams]
}
