import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { createSession } from '@/api/create-session'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'credentials',
      type: 'credentials',

      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'jhon@doe.com' },
        password: { label: 'Senha', type: 'password', placeholder: '********' },
      },

      name: 'credentials',

      async authorize(credentials) {
        if (!credentials) {
          return null
        }

        const user = await createSession({
          email: credentials.email,
          password: credentials.password,
        })

        return {
          email: user.email,
          name: user.name,
          id: user.id,
        }
      },
    }),
  ],
})

export { handler as GET, handler as POST }
