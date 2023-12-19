import React from 'react'
import { instance, mock } from 'ts-mockito'
import { anyToBuffer } from 'uiSrc/utils'
import { render, screen, fireEvent, act, waitForStack } from 'testSrc/helpers'
import { Props, PopoverDelete } from './PopoverDelete'

const mockedProps = mock<Props>()

describe('PopoverDelete', () => {
  it('should render', () => {
    expect(render(<PopoverDelete {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call showPopover on delete', async () => {
    const showPopover = vi.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        showPopover={showPopover}
      />,
    )

    // open popover
    await act(() => {
      fireEvent.click(screen.getByLabelText(/remove field/i))
    })
    await waitForStack()

    expect(showPopover).toBeCalledTimes(1)
  })

  it('should call handleDeleteItem on delete', async () => {
    const handleDeleteItem = vi.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        suffix="_"
        deleting="name_"
        handleDeleteItem={handleDeleteItem}
      />,
    )

    // open popover
    await act(() => {
      fireEvent.click(screen.getByLabelText(/remove field/i))
    })
    await waitForStack()

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
  })

  it('should call handleDeleteItem on delete with itemRaw prop', async () => {
    const itemRawMock = anyToBuffer([1, 2, 3])
    const handleDeleteItem = vi.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        itemRaw={itemRawMock}
        suffix="_"
        deleting="name_"
        handleDeleteItem={handleDeleteItem}
      />,
    )

    // open popover
    await act(() => {
      fireEvent.click(screen.getByLabelText(/remove field/i))
    })
    await waitForStack()

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
    expect(handleDeleteItem).toBeCalledWith(itemRawMock)
  })

  it('should call handleDeleteItem on delete with item prop if itemRaw is not defined', async () => {
    const itemMock = 'name'
    const handleDeleteItem = vi.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item={itemMock}
        itemRaw={undefined}
        suffix="_"
        deleting="name_"
        handleDeleteItem={handleDeleteItem}
      />,
    )

    // open popover
    await act(() => {
      fireEvent.click(screen.getByLabelText(/remove field/i))
    })
    await waitForStack()

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
    expect(handleDeleteItem).toBeCalledWith(itemMock)
  })
})
