'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Cell, flexRender } from '@tanstack/react-table'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { Debit } from '@/api/fetch-debts-by-period'
import { updateDebit } from '@/api/update-debit'
import { TableCell as UiTableCell } from '@/components/ui/table'
import { cellAtomFamily, periodIdAtom } from '@/store/table'

import { Input } from '../ui/input'

interface TableCellProps {
  cell: Cell<Debit, unknown>
}

const updateDebitSchema = z.object({
  id: z.string(),
  amount: z.coerce
    .number()
    .min(0)
    .optional()
    .transform((value) => (value ? value * 100 : value)),
  description: z.string().min(3).optional(),
})
type UpdateDebit = z.infer<typeof updateDebitSchema>

const fieldsToCanEdit = ['amount', 'description']

export function TableCell({ cell }: TableCellProps) {
  const { original: debit } = cell.getContext().row

  const queryClient = useQueryClient()

  const period = useAtomValue(periodIdAtom)

  const { id: fieldId } = cell.column

  const queryKey = ['debts', { period }]

  const updateDebitMutation = useMutation({
    mutationKey: ['updateDebit', debit.id],
    mutationFn: ({ id, ...data }: UpdateDebit) => updateDebit(id, data),
    onMutate(data) {
      const cache = queryClient.getQueryData<Debit[]>(queryKey)

      if (!cache) return

      queryClient.setQueriesData(
        {
          queryKey,
        },
        () => {
          return cache.map((debit) => {
            if (debit.id === data.id) {
              return {
                ...debit,
                ...data,
              }
            }

            return debit
          })
        },
      )
    },
  })

  const [cellState, setState] = useAtom(cellAtomFamily(cell.id))

  function handleBlur() {
    const debitToUpdate = updateDebitSchema.safeParse({
      id: debit.id,
      [fieldId]: cellState.inputState,
    })

    if (!debitToUpdate.success) {
      toast.error('Invalid value')

      return
    }

    setState({
      showInput: false,
    })

    updateDebitMutation.mutate(debitToUpdate.data)
  }

  useEffect(() => {
    setState({
      inputState: String(debit[fieldId as keyof Debit]),
    })
  }, [])

  return (
    <UiTableCell
      align="left"
      onDoubleClick={() => setState({ showInput: true })}
    >
      {cellState.showInput && fieldsToCanEdit.includes(fieldId) ? (
        <Input
          autoFocus
          type={fieldId === 'amount' ? 'number' : 'text'}
          onBlur={handleBlur}
          value={cellState.inputState}
          onChange={(e) =>
            setState({
              inputState: e.target.value,
            })
          }
        />
      ) : (
        flexRender(cell.column.columnDef.cell, cell.getContext())
      )}
    </UiTableCell>
  )
}
