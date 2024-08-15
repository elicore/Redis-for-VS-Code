import React, { ReactElement, ReactNode } from 'react'
import { isUndefined } from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'

import {
  AllKeyTypes,
  KeyTypes,
} from 'uiSrc/constants'
import { Maybe, RedisString } from 'uiSrc/interfaces'
import { editKeyTTL, refreshKeyInfo, useDatabasesStore, useSelectedKeyStore, editKey } from 'uiSrc/store'
import { TelemetryEvent, formatLongName, getGroupTypeDisplay, sendEventTelemetry } from 'uiSrc/utils'
import { PopoverDelete } from 'uiSrc/components'
import { RefreshBtn } from 'uiSrc/ui'
import { KeyDetailsHeaderFormatter } from './components/key-details-header-formatter'
import { KeyDetailsHeaderName } from './components/key-details-header-name'
import { KeyDetailsHeaderTTL } from './components/key-details-header-ttl'
import { KeyDetailsHeaderSizeLength } from './components/key-details-header-size-length'

import { useKeysApi } from '../keys-tree/hooks/useKeys'

import styles from './styles.module.scss'

export interface KeyDetailsHeaderProps {
  keyType: AllKeyTypes
  onCloseKey?: (key?: RedisString) => void
  onRemoveKey?: () => void
  onEditKey?: (key: RedisString, newKey: RedisString, onFailure?: () => void) => void
  Actions?: (props: { width: number, children: ReactNode }) => Maybe<ReactNode>
}

const KeyDetailsHeader = ({
  onCloseKey,
  onRemoveKey,
  onEditKey,
  keyType,
  Actions,
}: KeyDetailsHeaderProps) => {
  const { data, refreshDisabled, lastRefreshTime } = useSelectedKeyStore(useShallow((state) => ({
    data: state.data,
    refreshDisabled: state.refreshDisabled || state.loading,
    lastRefreshTime: state.lastRefreshTime,
  })))

  const { type = KeyTypes.String, name: keyBuffer, nameString: keyProp, length } = data ?? {}
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const keysApi = useKeysApi()

  const handleRefreshKey = () => {
    refreshKeyInfo(keyBuffer!)
  }

  const handleEditTTL = (key: RedisString, ttl: number) => {
    editKeyTTL(key, ttl, onEditKeyTTLSuccess)
  }

  const onEditKeyTTLSuccess = (ttl: number, prevTTL?: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_TTL_CHANGED,
      eventData: {
        databaseId,
        ttl: ttl >= 0 ? ttl : -1,
        previousTTL: prevTTL,
      },
    })
  }
  const handleEditKey = (oldKey: RedisString, newKey: RedisString, onFailure?: () => void) => {
    editKey(oldKey, newKey, () => onEditKey?.(oldKey, newKey), onFailure)
  }

  const handleDeleteKey = (key: RedisString) => {
    keysApi.deleteKeyAction(key, onRemoveKey)
  }

  const handleDeleteKeyClicked = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      eventData: {
        databaseId,
        keyType: type,
        source: 'keyValue',
      },
    })
  }

  const RefreshButton = () => (
    <RefreshBtn
      lastRefreshTime={lastRefreshTime}
      disabled={refreshDisabled}
      triggerClassName={styles.actionBtn}
      onClick={handleRefreshKey}
      triggerTestid="refresh-key-btn"
    />
  )

  return (
    <div className={`key-details-header ${styles.container}`} data-testid="key-details-header">
      {/* {loading && (
        <div>
          {l10n.t('loading...')}
        </div>
      )} */}
      {/* {!loading && ( */}
      <AutoSizer disableHeight>
        {({ width = 0 }) => (
          <div style={{ width }}>
            <div className={styles.keyFlexGroup}>
              <div>
                {getGroupTypeDisplay(type)}
              </div>
              <KeyDetailsHeaderName onEditKey={handleEditKey} />
            </div>
            <div className={styles.groupSecondLine}>
              <KeyDetailsHeaderSizeLength width={width} />
              <KeyDetailsHeaderTTL onEditTTL={handleEditTTL} />
              <div className="flex ml-auto">
                <div className={styles.subtitleActionBtns}>
                  {isUndefined(Actions) && <RefreshButton />}
                  {!isUndefined(Actions) && (
                    <Actions width={width}>
                      <RefreshButton />
                    </Actions>
                  )}
                  {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
                    <KeyDetailsHeaderFormatter width={width} />
                  )}
                  <PopoverDelete
                    item={keyProp!}
                    itemRaw={keyBuffer}
                    testid={`remove-key-${keyProp}`}
                    header={`${formatLongName(keyProp, 150)}`}
                    text={`${l10n.t(' will be deleted.')}`}
                    approveTextBtn={l10n.t('Delete')}
                    triggerClassName="group-hover:block"
                    handleDeleteItem={handleDeleteKey}
                    handleButtonClick={handleDeleteKeyClicked}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </AutoSizer>
      {/* )} */}
    </div>
  )
}

export { KeyDetailsHeader }
