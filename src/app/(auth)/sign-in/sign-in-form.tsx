'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createSession } from '@/api/create-sesstion'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const requiredFiledMessage = 'Campo obrigatório'

const formSchema = z.object({
  email: z
    .string({ required_error: requiredFiledMessage })
    .email('E-mail inválido'),
  password: z
    .string({ required_error: requiredFiledMessage })
    .min(4, 'Senha deve ter no mínimo 8 caracteres'),
})

type FormSchema = z.infer<typeof formSchema>

export function SignInForm() {
  const { push } = useRouter()

  const { mutateAsync: makeLogin } = useMutation({
    mutationFn: createSession,
    mutationKey: ['createSession'],
  })

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    values: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: FormSchema) {
    try {
      await makeLogin(values)

      push('/payments')

      toast.success('Login feito com sucesso')
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 401) {
        toast.error('E-mail ou senha inválidos')
      } else {
        toast.error('Erro ao fazer login')
      }
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="E-mail" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Senha" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button>Sign in</Button>
      </form>
    </Form>
  )
}
