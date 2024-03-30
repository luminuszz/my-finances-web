import { useMutation } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'

import { Debit } from '@/api/fetch-debts-by-period'
import { updateDebit } from '@/api/update-debit'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useDebitCache } from './use-debit-cache'

export const columns: ColumnDef<Debit>[] = [
  {
    accessorKey: 'description',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Descrição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue('description')}</div>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span className="text-right">Valor R$</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(row.getValue('amount'))

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span className="text-right">Status</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const { updateCache, revertCache } = useDebitCache()
      const { status, id } = row.original

      const { mutate: updateStatus, isPending } = useMutation({
        mutationKey: ['markDebitPaid', id],
        mutationFn: (status: 'pending' | 'paid') => updateDebit(id, { status }),
        onMutate(status) {
          return updateCache(id, { status })
        },
        onError() {
          revertCache()
        },
      })

      const formattedStatus =
        row.getValue('status') === 'pending' ? 'Pendente' : 'Pago'

      return (
        <Badge
          onClick={() => {
            if (!isPending) {
              updateStatus(status === 'pending' ? 'paid' : 'pending')
            }
          }}
          variant="secondary"
          data-isPaid={row.getValue('status') === 'paid'}
          className="cursor-pointer text-yellow-500 data-[isPaid=true]:text-emerald-500"
        >
          {formattedStatus}
        </Badge>
      )
    },
  },

  {
    id: 'actions',
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
