'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { importDebtCsvFile } from '@/api/inport-period-csv-file'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { periodIdAtom } from '@/store/table'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

const formSchema = z.object({
  file: z
    .unknown()
    .transform((value) => value as FileList | null | undefined)
    .nullable()
    .refine((value) => !!value, {
      message: 'Informe um arquivo válido',
    })
    .refine((value) => value?.[0].type === 'text/csv', {
      message: 'O arquivo deve ser do tipo csv',
    }),
})

type FormValues = z.infer<typeof formSchema>

export function ImportCsvDialog() {
  const currentPeriodId = useAtomValue(periodIdAtom)

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    reValidateMode: 'onChange',
    defaultValues: {
      file: null,
    },
  })

  const { mutateAsync: importCsvFile } = useMutation({
    mutationKey: ['import-csv', { period: currentPeriodId }],
    mutationFn: importDebtCsvFile,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['debts', { period: currentPeriodId }],
      })
    },
  })

  const queryClient = useQueryClient()

  async function onSubmit({ file }: FormValues) {
    try {
      if (!file) return

      const formData = new FormData()

      formData.set('csv', file[0])

      await importCsvFile({
        data: formData,
        periodId: currentPeriodId,
      })

      toast.success('Arquivo importado com sucesso')

      reset()
    } catch (e) {
      toast.error('Erro ao importar arquivo')
    }
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle className="flex gap-1">
            <DollarSign className="mr-2 size-4 text-muted-foreground" />{' '}
            Importar arquivo csv
          </DialogTitle>

          <DialogDescription>
            Adicionar débitos de um arquivo csv
          </DialogDescription>
        </DialogHeader>

        <div className="my-5 space-y-4">
          <Label htmlFor="csv">Arquivo .csv</Label>
          <Input translate="yes" id="csv" type="file" {...register('file')} />
          <p className="text-sm text-red-300">{errors.file?.message}</p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>

          <Button type="submit">Importar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
