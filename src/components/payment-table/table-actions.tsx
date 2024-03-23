'use client'

import { Table } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { map } from 'lodash'
import { ChevronDown } from 'lucide-react'

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

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface TableActionsProps {
  table: Table<Debit>
  periods: Period[]
}

export function TableActions({ table, periods }: TableActionsProps) {
  const [, setParams] = useQueryString()

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

  return (
    <div className="flex items-center py-4">
      <div className="flex gap-2">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Períodos <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {periodsOptions.map((period) => (
            <DropdownMenuItem onClick={() => handleSetPeriod(period.value)}>
              {period.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
