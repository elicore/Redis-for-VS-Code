import axios, { AxiosError, CancelTokenSource } from 'axios'
import { immer } from 'zustand/middleware/immer'
import { devtools, persist } from 'zustand/middleware'
import { create } from 'zustand'
import { isNull, remove } from 'lodash'

import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { DEFAULT_SEARCH_MATCH, ApiEndpoints, KeyTypes, successMessages, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import {
  TelemetryEvent,
  getApiErrorMessage,
  getDatabaseId,
  getEncoding,
  getMatchType,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  sendEventTelemetry,
  showErrorMessage,
  showInformationMessage,
} from 'uiSrc/utils'
import { GetKeysWithDetailsResponse, KeysStore, KeysActions } from './interface'
import { parseKeysListResponse } from '../utils'

export const initialState: KeysStore = {
  deleting: false,
  loading: false,
  filter: null,
  search: '',
  isSearched: false,
  isFiltered: false,
  data: {
    total: 0,
    scanned: 0,
    nextCursor: '0',
    keys: [],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: null,
  },
}
export const useKeysStore = create<KeysStore & KeysActions>()(
  immer(devtools(persist((set) => ({
    ...initialState,
    // actions
    loadKeys: () => set({ loading: true }),
    loadKeysFinal: () => set({ loading: false }),

    loadKeysSuccess: (data) => set((state) => {
      state.data = {
        ...data,
        previousResultCount: data.keys?.length,
        lastRefreshTime: Date.now(),
      }
    }),

    loadMoreKeysSuccess: ({ total, scanned, nextCursor, keys, shardsMeta }) => set((state) => {
      state.data.keys = state.data.keys.concat(keys)
      state.data.total = total
      state.data.scanned = scanned
      state.data.nextCursor = nextCursor
      state.data.shardsMeta = shardsMeta
      state.data.previousResultCount = keys.length

      state.loading = false
    }),
    deleteKey: () => set({ deleting: true }),
    deleteKeyFinal: () => set({ deleting: false }),
    deleteKeyFromList: (keyProp) => set((state) => {
      if (state.data?.keys.length === 0) {
        return
      }
      remove(state.data?.keys, (key) => isEqualBuffers(key.name, keyProp))

      state.data.total = !isNull(state.data.total) ? state.data.total - 1 : null
      state.data.scanned -= 1
    }),
  }),
  { name: 'keys' }))),
)

// eslint-disable-next-line import/no-mutable-exports
export let sourceKeysFetch: Nullable<CancelTokenSource> = null

// Asynchronous thunk action
export function fetchPatternKeysAction(
  cursor: string = '0',
  count: number = SCAN_TREE_COUNT_DEFAULT,
  telemetryProperties: { [key: string]: any } = {},
  onSuccess?: (data: GetKeysWithDetailsResponse[]) => void,
  onFailed?: () => void,
) {
  return useKeysStore.setState(async (state) => {
    state.loadKeys()

    try {
      sourceKeysFetch?.cancel?.()
      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const { search: match, filter: type } = state

      const { data, status } = await apiService.post<GetKeysWithDetailsResponse[]>(
        getUrl(ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding: getEncoding() },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        state.loadKeysSuccess(parseKeysListResponse({}, data))
        let matchValue = DEFAULT_SEARCH_MATCH
        let event = TelemetryEvent.TREE_VIEW_KEYS_SCANNED
        if (!!type || !!match) {
          if (match !== DEFAULT_SEARCH_MATCH && !!match) {
            matchValue = getMatchType(match)
          }
          event = TelemetryEvent.TREE_VIEW_KEYS_SCANNED_WITH_FILTER_ENABLED
        }
        sendEventTelemetry({
          event,
          eventData: {
            databaseId: getDatabaseId(),
            keyType: type,
            match: matchValue,
            databaseSize: data[0].total,
            numberOfKeysScanned: data[0].scanned,
            scanCount: count,
            source: telemetryProperties.source ?? 'manual',
            ...telemetryProperties,
          },
        })
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        showErrorMessage(errorMessage)
        onFailed?.()
      }
    } finally {
      state.loadKeysFinal()
    }
  })
}

// Asynchronous thunk action
export function fetchMorePatternKeysAction(cursor: string, count: number = SCAN_TREE_COUNT_DEFAULT) {
  return useKeysStore.setState(async (state) => {
    state.loadKeys()

    try {
      sourceKeysFetch?.cancel?.()

      const { CancelToken } = axios
      sourceKeysFetch = CancelToken.source()

      const { search: match, filter: type } = state
      const { data, status } = await apiService.post(
        getUrl(ApiEndpoints.KEYS),
        {
          cursor, count, type, match: match || DEFAULT_SEARCH_MATCH, keysInfo: false,
        },
        {
          params: { encoding: getEncoding() },
          cancelToken: sourceKeysFetch.token,
        },
      )

      sourceKeysFetch = null
      if (isStatusSuccessful(status)) {
        const newKeysData = parseKeysListResponse(
          state.data.shardsMeta,
          data,
        )
        state.loadMoreKeysSuccess(newKeysData)
        sendEventTelemetry({
          event: TelemetryEvent.TREE_VIEW_KEYS_ADDITIONALLY_SCANNED,
          eventData: {
            databaseId: getDatabaseId(),
            databaseSize: data[0].total,
            numberOfKeysScanned: state.data.scanned + data[0].scanned,
            scanCount: count,
          },
        })
      }
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        showErrorMessage(errorMessage)
      }
    } finally {
      state.loadKeysFinal()
    }
  })
}

// Asynchronous thunk action
export function fetchKeysMetadataTree(
  keys: RedisString[][],
  filter: Nullable<KeyTypes>,
  signal?: AbortSignal,
  onSuccessAction?: (data: KeyInfo[]) => void,
  onFailAction?: () => void,
) {
  return useKeysStore.setState(async (state) => {
    try {
      const { data } = await apiService.post<KeyInfo[]>(
        getUrl(ApiEndpoints.KEYS_METADATA),
        { keys: keys.map(([,nameBuffer]) => nameBuffer), type: filter || undefined },
        { params: { encoding: getEncoding() }, signal },
      )

      const newData = data.map((key, i) => ({ ...key, path: keys[i][0] || 0 })) as KeyInfo[]

      onSuccessAction?.(newData)
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        onFailAction?.()
        console.error(error)
      }
    }
  })
}

// Asynchronous thunk action
export function deleteKeyAction(
  key: RedisString,
  onSuccessAction?: () => void,
) {
  return useKeysStore.setState(async (state) => {
    state.deleteKey()
    try {
      const { status } = await apiService.delete(
        getUrl(ApiEndpoints.KEYS),
        {
          data: { keyNames: [key] },
          params: { encoding: getEncoding() },
        },
      )

      if (isStatusSuccessful(status)) {
        state.deleteKeyFromList(key)
        showInformationMessage(successMessages.DELETED_KEY(key).title)
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showErrorMessage(errorMessage)
    } finally {
      state.deleteKeyFinal()
    }
  })
}
