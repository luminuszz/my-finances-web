'use client'

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
import { useSetAtom } from 'jotai'
import { last } from 'lodash'
import { useEffect, useState } from 'react'

import { fetchDebtsByPeriod } from '@/api/fetch-debts-by-period'
import { Period } from '@/api/fetch-user-periods'
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

import { columns } from './columns'
import { TableActions } from './table-actions'
import { TableRow as CustomTableCell } from './table-row'

interface PaymentTableProps {
  periods: Period[]
}

export function PaymentTable({ periods }: PaymentTableProps) {
  const lastPeriod = last(periods)

  const [params] = useQueryString()

  const periodId = params.get('periodId') ?? lastPeriod?.id ?? ''

  const saveCurrentPeriodId = useSetAtom(periodIdAtom)

  const { data: debts = [] } = useQuery({
    queryKey: ['debts', { period: periodId }],
    queryFn: () => fetchDebtsByPeriod(periodId),
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">{rowCount}</div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}