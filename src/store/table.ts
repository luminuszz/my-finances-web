import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

// SortingState, ColumnFiltersState, VisibilityState

type CellState = {
  id: string
  showInput: boolean
  inputState: string
}

export const periodIdAtom = atom('')

export const cellAtomFamily = atomFamily((cellId: string) =>
  atom(
    {
      id: cellId,
      showInput: false,
      inputState: '',
    },
    (get, set, inputState: Partial<CellState>) => {
      set(cellAtomFamily(cellId), {
        ...get(cellAtomFamily(cellId)),
        ...(inputState as CellState),
      })
    },
  ),
)
