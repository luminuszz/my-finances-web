import * as numberInputMachine from '@zag-js/number-input'
import { normalizeProps, useMachine } from '@zag-js/react'

import { Input } from './ui/input'

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
  id?: string
  className?: string
  placeholder?: string
}

export function AmountInput({
  onChange,
  value,
  className,
  id = 'amountInput',
  ...props
}: AmountInputProps) {
  const [state, dispatch] = useMachine(
    numberInputMachine.machine({
      id,
      value: String(value),
      inputMode: 'decimal',
      onValueChange: (value) => {
        onChange(value.valueAsNumber)
      },
      formatOptions: {
        maximumFractionDigits: 2,
        currency: 'BRL',
        style: 'currency',
      },
      locale: 'pt-BR',
    }),
  )

  const api = numberInputMachine.connect(state, dispatch, normalizeProps)

  return (
    <Input
      {...api.inputProps}
      className={className}
      placeholder={props.placeholder}
    />
  )
}
