'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createDebt } from '@/api/create-debt'
import { Debit } from '@/api/fetch-debts-by-period'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { periodIdAtom } from '@/store/table'

import { AmountInput } from './amount-input'
import { Button } from './ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { Input } from './ui/input'

const formSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce
    .number()
    .min(0)
    .transform((value) => (value * 100).toFixed(2))
    .transform(Number),
})

type FormValues = z.infer<typeof formSchema>

export function CreateDebitDialog() {
  const currentPeriodId = useAtomValue(periodIdAtom)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      amount: 0,
      description: '',
    },
  })

  const queryClient = useQueryClient()

  function updateDebitCache(values: FormValues) {
    const cache = queryClient.getQueryData<Debit[]>([
      'debts',
      { period: currentPeriodId },
    ])

    const debtId = Math.random().toString()

    const newDebitData: Debit = {
      amount: values.amount,
      createdAt: new Date(),
      description: values.description,
      expiresAt: null,
      id: debtId,
      periodId: currentPeriodId,
      status: 'pending',
      updatedAt: new Date(),
    }

    queryClient.setQueryData<Debit[]>(
      ['debts', { period: currentPeriodId }],
      [...(cache ?? []), newDebitData],
    )

    return cache
  }

  const createDebtMutation = useMutation({
    mutationFn: createDebt,
    mutationKey: ['create-debt'],
    onMutate(values) {
      const oldCache = updateDebitCache({
        amount: values.amount,
        description: values.description,
      })

      return oldCache
    },

    onError(_, __, cache) {
      queryClient.setQueryData<Debit[]>(
        ['debts', { period: currentPeriodId }],
        cache,
      )
    },
  })

  async function onSubmit({ amount, description }: FormValues) {
    try {
      await createDebtMutation.mutateAsync({
        amount,
        description,
        paymentPeriodId: currentPeriodId,
      })
      toast.success('Debito criado com sucesso')

      form.reset({ amount: 0, description: '' })
    } catch (e) {
      toast.error('Erro ao criar debito')
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex gap-1">
          <DollarSign className="mr-2 size-4 text-muted-foreground" /> Novo
          Debito
        </DialogTitle>

        <DialogDescription>
          Adicionar um novo debito ao período
        </DialogDescription>
      </DialogHeader>

      <div className="my-5 space-y-4">
        <Form {...form}>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} type="text" placeholder="Descrição" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AmountInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Valor"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancelar</Button>
        </DialogClose>

        <DialogClose asChild>
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>
            Criar
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
