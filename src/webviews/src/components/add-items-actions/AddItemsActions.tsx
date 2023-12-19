import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import React from 'react'
import { VscDiffAdded, VscTrash } from 'react-icons/vsc'

export interface Props {
  id: number
  length: number
  index: number
  loading: boolean
  removeItem: (id: number) => void
  addItem: () => void
  anchorClassName?: string
  clearItemValues?: (id: number) => void
  clearIsDisabled?: boolean
  addItemIsDisabled?: boolean
  'data-testid'?: string
}

const AddItemsActions = (props: Props) => {
  const {
    id,
    length,
    loading,
    removeItem,
    index,
    addItem,
    anchorClassName,
    clearItemValues,
    clearIsDisabled,
    addItemIsDisabled,
    'data-testid': dataTestId,
  } = props

  const handleClick = () => {
    if (length !== 1) {
      removeItem(id)
    } else {
      clearItemValues?.(id)
    }
  }

  return (
    <div className="flex items-center justify-center" style={{ width: 80 }}>
      <div style={{ width: 60 }} className="flex-row space-between action-buttons">
        {!clearIsDisabled && (
          <div title={length === 1 ? 'Clear' : 'Remove'}>
            <VSCodeButton
              appearance="icon"
              disabled={loading}
              data-testid="remove-item"
              onClick={handleClick}
              aria-label={length === 1 ? 'Clear Item' : 'Remove Item'}
              className={anchorClassName}
            >
              <VscTrash />
            </VSCodeButton>
          </div>
        )}
        { (index === length - 1) && (
          <div title="Add">
            <VSCodeButton
              appearance="icon"
              disabled={loading || addItemIsDisabled}
              data-testid={dataTestId || 'add-new-item'}
              onClick={addItem}
              aria-label="Add new item"
              className={anchorClassName}
            >
              <VscDiffAdded />
            </VSCodeButton>
          </div>
        )}
      </div>
    </div>
  )
}

export { AddItemsActions }