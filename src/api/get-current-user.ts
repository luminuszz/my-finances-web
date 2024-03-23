import { myFinancesApi, setCookies } from '@/lib/axios'

interface UserResponse {
  name: string
  email: string
  id: string
}

export async function getCurrentUser(cookies?: string): Promise<UserResponse> {
  if (cookies) {
    setCookies(myFinancesApi.defaults.headers, cookies)
  }

  const response = await myFinancesApi.get<UserResponse>('/users/me')

  return response.data
}
