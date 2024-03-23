import { Row } from '@tanstack/react-table'

import { Debit } from '@/api/fetch-debts-by-period'
import { TableRow as UiTableRow } from '@/components/ui/table'

import { TableCell } from './table-cell'

interface TableRowProps {
  rowState: Row<Debit>
}

export function TableRow({ rowState: row }: TableRowProps) {
  return (
    <UiTableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell cell={cell} key={cell.id} />
      ))}
    </UiTableRow>
  )
}
