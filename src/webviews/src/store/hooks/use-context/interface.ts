import { RelativeWidthSizes } from 'uiSrc/components/virtual-table/interfaces'
import { KeyTypes, SortOrder } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'

export interface AppContextStore {
  lastPage: string
  dbConfig: {
    treeViewSort: SortOrder
  }
  keys: {
    tree: {
      openNodes: OpenNodes
      selectedLeaf: Nullable<string>
    }
  }
  browser: {
    keyDetailsSizes: {
      [key: string]: Nullable<RelativeWidthSizes>
    }
  }
}

export interface AppContextActions {
  // setAppContextInitialState: () => void
  // setAppContextConnectedDatabaseId: () => void
  // setDbConfig: () => void
  // setKeysTreeDelimiter: () => void
  setKeysTreeSort: (databaseId: string, sort: SortOrder) => void
  setKeysTreeNodesOpen: (nodes: OpenNodes) => void
  resetKeysTree: () => void
  updateKeyDetailsSizes: (data: { type: KeyTypes, sizes: RelativeWidthSizes }) => void
}

export interface OpenNodes {
  [key: string]: boolean
}
