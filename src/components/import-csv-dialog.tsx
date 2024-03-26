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
  fileList: z
    .instanceof(FileList)
    .refine((value) => value.length > 0, {
      message: 'Informe um arquivo válido',
    })
    .refine((value) => value[0].type === 'text/csv', {
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const fileList = watch('fileList')

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

  async function onSubmit({ fileList }: FormValues) {
    try {
      const file = fileList[0]

      const formData = new FormData()

      formData.set('csv', file)

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
      <DialogHeader>
        <DialogTitle className="flex gap-1">
          <DollarSign className="mr-2 size-4 text-muted-foreground" /> Importar
          arquivo csv
        </DialogTitle>

        <DialogDescription>
          Adicionar débitos de um arquivo csv
        </DialogDescription>
      </DialogHeader>

      <div className="my-5 space-y-4">
        <Label htmlFor="csv">Arquivo .csv</Label>
        <Input {...register('fileList')} id="csv" type="file" />
        <p className="text-sm text-red-300">{errors.fileList?.message}</p>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="secondary">Cancelar</Button>
        </DialogClose>

        <DialogClose asChild>
          <Button
            disabled={fileList?.length === 0}
            type="button"
            onClick={handleSubmit(onSubmit)}
          >
            Importar
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}
