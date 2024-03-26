import axios, { AxiosError } from 'axios'

export const myFinancesApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

export const isUnauthorizedError = (error: AxiosError): boolean =>
  [401, 403].includes(error.response?.status || 0)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setCookies = (headers: any, cookie: string) => {
  headers.Cookie = cookie

  return headers
}
