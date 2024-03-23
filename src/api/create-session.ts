import { myFinancesApi } from '@/lib/axios'

interface CreateSessionRequest {
  email: string
  password: string
}

interface CreateSessionResponse {
  userData: {
    email: string
    name: string
    id: string
  }
}

export async function createSession({ email, password }: CreateSessionRequest) {
  const response = await myFinancesApi.post<CreateSessionResponse>(
    'users/sign-in',
    {
      email,
      password,
    },
  )

  return response.data.userData
}
