import React, { FC, ReactElement } from 'react'
import { VSCodeOption } from '@vscode/webview-ui-toolkit/react'
import cx from 'classnames'

import { Nullable } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface SelectOption {
  value: string
  label: ReactElement | string
  testid?: string
}

export interface Props {
  options: SelectOption[]
  onChange: (event: string) => void
  disabled?: boolean
  idSelected?: Nullable<string>
  containerClassName?: string
  itemClassName?: string
  position?: 'above' | 'below'
  testid?: string
}

export const Select: FC<Props> = (props) => {
  const {
    options,
    onChange,
    idSelected,
    containerClassName,
    itemClassName,
    testid,
    position = 'below',
    disabled,
  } = props

  return (
    // React component doesn't work with "position" prop
    <vscode-dropdown
      position={position}
      class={cx(styles.container, containerClassName)}
      data-testid={testid}
      // @ts-ignore note: if disabled:false select will be disabled
      disabled={disabled || undefined}
    >
      {options.map(({ value, label, testid }) => (
        <VSCodeOption
          value={value}
          key={value}
          onClick={() => onChange(value)}
          data-testid={testid}
          className={cx(styles.option, itemClassName)}
          selected={idSelected === value}
        >
          {label}
        </VSCodeOption>
      ))}
    </vscode-dropdown>
  )
}
