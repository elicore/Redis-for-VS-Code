import React from 'react'
import { cloneDeep } from 'lodash'
import { cleanup } from '@testing-library/react'
import { Mock, vi } from 'vitest'

import {
  getUserConfigSettings,
  setSettingsPopupState,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings.slice'
import { loadDatabases } from 'uiSrc/slices/connections/databases/databases.slice'
import { getServerInfo } from 'uiSrc/slices/app/info/info.slice'
import { getRedisCommands } from 'uiSrc/slices/app/commands/redis-commands.slice'
import { mockedStore, render } from 'testSrc/helpers'
import { Config } from './Config'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

vi.mock('uiSrc/slices/user/user-settings.slice', async () => ({
  ...(await vi.importActual<object>('uiSrc/slices/user/user-settings.slice')),
  userSettingsSelector: vi.fn().mockReturnValue({
    config: {
      agreements: {},
    },
    spec: {
      agreements: {},
    },
  }),
}))

vi.mock('uiSrc/slices/app/info', async () => ({
  ...(await vi.importActual<object>('uiSrc/slices/app/info')),
  appServerInfoSelector: vi.fn(),
}))

vi.mock('uiSrc/services', async () => ({
  ...(await vi.importActual<object>('uiSrc/services')),
  localStorageService: {
    set: vi.fn(),
    get: vi.fn(),
  },
}))

describe('Config', () => {
  it('should render', () => {
    render(<Config />)
    const afterRenderActions = [
      getServerInfo(),
      getRedisCommands(),
      loadDatabases(),
      // setSettingsPopupState(false),
      getUserConfigSettings(),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
  })

  it('should call the list of actions', () => {
    const userSettingsSelectorMock = vi.fn().mockReturnValue({
      config: {
        agreements: {},
      },
      spec: {
        agreements: {
          eula: {
            defaultValue: false,
            required: true,
            editable: false,
            since: '1.0.0',
            title: 'EULA: RedisInsight License Terms',
            label: 'Label',
          },
        },
      },
    });
    (userSettingsSelector as Mock).mockImplementation(userSettingsSelectorMock)
    render(<Config />)
    const afterRenderActions = [
      getServerInfo(),
      getRedisCommands(),
      loadDatabases(),
      getUserConfigSettings(),
      // setSettingsPopupState(true),
    ]
    expect(store.getActions()).toEqual([...afterRenderActions])
  })
})
