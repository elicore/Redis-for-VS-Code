import { KeyTypes, KeyValueCompressor } from 'uiSrc/constants'
import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'

export interface KeysStore {
  loading: boolean
  error: string
  isFiltered: boolean
  isSearched: boolean
  search: string
  filter: Nullable<KeyTypes>
  data: KeysStoreData
  selectedKey: {
    loading: boolean
    refreshing: boolean
    lastRefreshTime: Nullable<number>
    error: string
    data: Nullable<KeyInfo>
    length?: number
    compressor: Nullable<KeyValueCompressor>
  },
  addKey: {
    loading: boolean
    error: string
  }
}

export interface KeysStoreData {
  total: Nullable<number>
  scanned: number
  nextCursor: string
  keys: KeyInfo[]
  shardsMeta: Record<string, GetKeysWithDetailsResponse>
  previousResultCount: number
  lastRefreshTime: Nullable<number>
  maxResults?: Nullable<number>
}

export interface GetKeysWithDetailsResponse {
  cursor: number
  total: number
  scanned: number
  keys: KeyInfo[]
  host?: string
  port?: number
  maxResults?: number
}

export interface GetKeysWithDetailsShardResponse extends GetKeysWithDetailsResponse {
  id?: string
}

export interface SetStringWithExpire {
  keyName: RedisString
  value: RedisString
  expire?: number
}