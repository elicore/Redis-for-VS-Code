import isGlob from 'is-glob'
import { cloneDeep, get } from 'lodash'

import { AdditionalRedisModule, store } from 'uiSrc/store'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, DEFAULT_SUMMARY, SUPPORTED_REDIS_MODULES } from 'uiSrc/constants'
import { IModuleSummary, IRedisModulesSummary, ITelemetrySendEvent, MatchType, RedisModules, RedisModulesKeyType } from './interfaces'
import { isRedisearchAvailable, isTriggeredAndFunctionsAvailable } from '../browser/modules'

export const sendEventTelemetry = async ({ event, eventData = {} }: ITelemetrySendEvent) => {
  try {
    const isAnalyticsGranted = checkIsAnalyticsGranted() || import.meta.env.DEV
    if (!isAnalyticsGranted) {
      return
    }
    await apiService.post(`${ApiEndpoints.ANALYTICS_SEND_EVENT}`, { event, eventData })
  } catch (e) {
    // continue regardless of error
  }
}

export const getMatchType = (match: string): MatchType => (
  !isGlob(match, { strict: false })
    ? MatchType.EXACT_VALUE_NAME
    : MatchType.PATTERN
)

// Check is user give access to collect his events
export const checkIsAnalyticsGranted = (): boolean =>
  !!get(store.getState(), 'user.settings.config.agreements.analytics', false)

const getEnumKeyBValue = (myEnum: any, enumValue: number | string): string => {
  const keys = Object.keys(myEnum)
  const index = keys.findIndex((x) => myEnum[x] === enumValue)
  return index > -1 ? keys[index] : ''
}

const getModuleSummaryToSent = (module: AdditionalRedisModule): IModuleSummary => ({
  loaded: true,
  version: module.version,
  semanticVersion: module.semanticVersion,
})

export const getRedisModulesSummary = (modules: AdditionalRedisModule[] = []): IRedisModulesSummary => {
  const summary = cloneDeep(DEFAULT_SUMMARY)
  try {
    modules.forEach(((module) => {
      if (SUPPORTED_REDIS_MODULES[module.name as any]) {
        const moduleName = getEnumKeyBValue(RedisModules, module.name)
        summary[moduleName as RedisModulesKeyType] = getModuleSummaryToSent(module)
        return
      }

      if (isRedisearchAvailable([module])) {
        const redisearchName = getEnumKeyBValue(RedisModules, RedisModules.RediSearch)
        summary[redisearchName as RedisModulesKeyType] = getModuleSummaryToSent(module)
        return
      }

      if (isTriggeredAndFunctionsAvailable([module])) {
        const triggeredAndFunctionsName = getEnumKeyBValue(RedisModules, RedisModules['Triggers and Functions'])
        summary[triggeredAndFunctionsName as RedisModulesKeyType] = getModuleSummaryToSent(module)
        return
      }

      summary.customModules.push(module)
    }))
  } catch (e) {
    // continue regardless of error
  }
  return summary
}
