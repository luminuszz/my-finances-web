'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { format, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import dayjs from 'dayjs'
import { Calendar as CalendarIcon, DollarSign } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { createPeriod } from '@/api/create-period'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from './ui/form'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

const formSchema = z
  .object({
    period: z.object({
      startPeriod: z.date(),
      endPeriod: z.date(),
    }),
  })
  .superRefine((context, ctx) => {
    const endPeriodIsAfterStartPeriod = isAfter(
      context.period.endPeriod,
      context.period.startPeriod,
    )

    if (!endPeriodIsAfterStartPeriod) {
      ctx.addIssue({
        code: 'custom',
        message: 'A data final deve ser depois da data inicial',
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

export function CreatePeriodDialog() {
  const createPeriodMutation = useMutation({
    mutationFn: createPeriod,
    mutationKey: ['createPeriod'],
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period: {
        startPeriod: dayjs().toDate(),
        endPeriod: dayjs().add(1, 'month').toDate(),
      },
    },
  })

  async function onSubmit({ period }: FormValues) {
    try {
      const payload = {
        startPeriod: period.startPeriod.toISOString(),
        endPeriod: period.endPeriod.toISOString(),
      }

      await createPeriodMutation.mutateAsync(payload)
      form.reset()

      toast.success('Período criado com sucesso')

      revalidatePath('/payments')
    } catch (e) {
      toast.error('Erro ao criar período')
    }
  }

  const formPeriod = form.watch('period')

  const displayPeriod = `
  ${format(formPeriod.startPeriod, 'LLL dd, y', { locale: ptBR })} - 
  ${format(formPeriod.endPeriod, 'LLL dd, y', { locale: ptBR })}`

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex gap-1">
          <DollarSign className="mr-2 size-4 text-muted-foreground" /> Novo
          Período
        </DialogTitle>

        <DialogDescription>
          Adicione um novo período para gerenciar os débitos.
        </DialogDescription>
      </DialogHeader>

      <div className="my-5">
        <Form {...form}>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn('w-full justify-start text-left font-normal')}
                >
                  <CalendarIcon className="mr-2 size-4" /> {displayPeriod}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Calendar
                          defaultMonth={field.value.startPeriod}
                          onSelect={(range) => {
                            field.onChange({
                              startPeriod:
                                range?.from ?? field.value.startPeriod,
                              endPeriod: range?.to ?? field.value.endPeriod,
                            })
                          }}
                          selected={{
                            from: field.value.startPeriod,
                            to: field.value.endPeriod,
                          }}
                          initialFocus
                          mode="range"
                          numberOfMonths={2}
                          locale={ptBR}
                        />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </PopoverContent>
            </Popover>
          </div>
        </Form>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancelar</Button>
        </DialogClose>
        <Button
          disabled={form.formState.isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
        >
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
