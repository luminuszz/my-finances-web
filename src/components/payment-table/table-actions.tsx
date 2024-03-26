'use client'

import { Table } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { find, map } from 'lodash'
import { ArrowUpFromLine, ChevronDown, Plus } from 'lucide-react'

import { Debit } from '@/api/fetch-debts-by-period'
import { Period } from '@/api/fetch-user-periods'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useQueryString } from '@/hooks/useQueryString'
import { periodIdAtom } from '@/store/table'

import { CreatePeriodDialog } from '../create-period-dialog'
import { ImportCsvDialog } from '../import-csv-dialog'
import { Button } from '../ui/button'
import { Dialog, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'

interface TableActionsProps {
  table: Table<Debit>
  periods: Period[]
}

export function TableActions({ table, periods }: TableActionsProps) {
  const [, setParams] = useQueryString()

  const currentPeriodId = useAtomValue(periodIdAtom)

  const periodsOptions = map(periods, (period) => {
    return {
      label: `${dayjs(period.startPeriod).format('DD/MM/YYYY')} - ${dayjs(period.endPeriod).format('DD/MM/YYYY')}`,
      value: period.id,
    }
  })

  function handleSetPeriod(periodId: string) {
    setParams((params) => {
      params.set('periodId', periodId)

      return params
    })
  }

  const selectedPeriod = find(periodsOptions, { value: currentPeriodId })

  return (
    <Dialog>
      <CreatePeriodDialog />

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filtrar por descrição"
            value={
              (table.getColumn('description')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('description')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {selectedPeriod ? selectedPeriod.label : 'Períodos'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {periodsOptions.map((period) => (
                <DropdownMenuItem onClick={() => handleSetPeriod(period.value)}>
                  {period.label}
                </DropdownMenuItem>
              ))}

              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <Plus className="mr-1 size-4 text-muted-foreground" />
                  Novo período
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <ImportCsvDialog />
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowUpFromLine className="mr-2 size-4 text-emerald-500" />
                Importar arquivo CSV
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
    </Dialog>
  )
}
