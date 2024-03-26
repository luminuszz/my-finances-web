'use client'

import { Dialog, DialogTrigger } from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'
import { compareDesc } from 'date-fns'
import { useSetAtom } from 'jotai'
import { last, map } from 'lodash'
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

import { fetchDebtsByPeriod } from '@/api/fetch-debts-by-period'
import { fetchUserPeriods, Period } from '@/api/fetch-user-periods'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQueryString } from '@/hooks/useQueryString'
import { periodIdAtom } from '@/store/table'

import { CreateDebitDialog } from '../create-debit-dialog'
import { columns } from './columns'
import { TableActions } from './table-actions'
import { TableRow as CustomTableCell } from './table-row'

interface PaymentTableProps {
  periods: Period[]
}

export function PaymentTable({ periods: periodsData }: PaymentTableProps) {
  const { data: periods } = useQuery({
    queryKey: ['periods'],
    queryFn: () => fetchUserPeriods(),
    initialData: periodsData,
  })

  const lastPeriod = last(periods)

  const [params] = useQueryString()

  const periodId = params.get('periodId') ?? lastPeriod?.id ?? ''

  const saveCurrentPeriodId = useSetAtom(periodIdAtom)

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts', { period: periodId }],
    queryFn: () => fetchDebtsByPeriod(periodId),
    select: (data) => {
      return map(data, (debit) => ({
        ...debit,
        amount: debit.amount / 100,
      })).sort((a, b) => compareDesc(a.createdAt, b.updatedAt))
    },
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: debts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const rowCount = `${table.getFilteredSelectedRowModel().rows.length} of 
  ${table.getFilteredRowModel().rows.length} row(s) selected.`

  const canShowTableContent = !!table.getRowModel().rows?.length

  useEffect(() => {
    saveCurrentPeriodId(periodId)
  }, [periodId])

  return (
    <div className="w-full ">
      <TableActions table={table} periods={periods} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {canShowTableContent ? (
              table
                .getRowModel()
                .rows.map((row) => <CustomTableCell rowState={row} />)
            ) : (
              <TableRow className="hover:">
                <TableCell
                  align="center"
                  className="h-52"
                  colSpan={columns.length}
                >
                  {isLoading ? (
                    <Loader2 className="size-10 animate-spin text-center text-muted-foreground" />
                  ) : (
                    'Sem resultados'
                  )}
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell align="left" colSpan={columns.length}>
                <Dialog>
                  <CreateDebitDialog />
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="mr-2 size-4 text-muted-foreground" />
                      Novo debito
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">{rowCount}</div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  )
}
