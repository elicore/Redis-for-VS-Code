import React from 'react'
import parse from 'html-react-parser'
import { isUndefined } from 'lodash'

import { localStorageService } from 'uiSrc/services'
import {
  ClusterNode,
  // RedisDefaultModules,
  // COMMAND_MODULES,
  CommandExecutionStatus,
} from 'uiSrc/interfaces'
import {
  StorageItem,
  // ICommands,
  SelectCommand,
  CommandGroup,
} from 'uiSrc/constants'
// import { ModuleCommandPrefix } from 'uiSrc/pages/workbench/constants'
// import { SelectCommand } from 'uiSrc/constants/cliOutput'

// import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { getDbIndex } from 'uiSrc/utils'
import { formatToText } from './cliTextFormatter'
import { useCliOutputStore } from '../hooks/cli-output/useCliOutputStore'

export enum CliPrefix {
  Cli = 'cli',
  QueryCard = 'query-card',
}

// interface IGroupModeCommand {
//   command: string
//   response: string
//   // status: CommandExecutionStatus
// }

const cliParseTextResponseWithOffset = (
  text: string = '',
  command: string = '',
  status: CommandExecutionStatus = CommandExecutionStatus.Success,
) => [cliParseTextResponse(text, command, status), '\n']

const replaceEmptyValue = (value: any) => {
  if (
    isUndefined(value) || value === '' || value === false) {
    return '(nil)'
  }
  return value
}

const cliParseTextResponse = (
  text: string | JSX.Element = '',
  command: string = '',
  status: CommandExecutionStatus = CommandExecutionStatus.Success,
  prefix: CliPrefix = CliPrefix.Cli,
  isParse: boolean = false,
) => (
  <span
    key={Math.random()}
    className={
      status === CommandExecutionStatus.Success
        ? `${prefix}-output-response-success`
        : `${prefix}-output-response-fail text-vscode-errorForeground`
    }
    data-testid={
      status === CommandExecutionStatus.Success
        ? `${prefix}-output-response-success`
        : `${prefix}-output-response-fail text-vscode-errorForeground`
    }
  >
    {isParse ? parse(formatToText(text, command)) : formatToText(text, command)}
  </span>
)

const cliCommandOutput = (command: string, dbIndex = 0) => ['\n', bashTextValue(dbIndex), cliCommandWrapper(command), '\n']

const bashTextValue = (dbIndex = 0) => `${getDbIndex(dbIndex)} > `.trimStart()

const cliCommandWrapper = (command: string) => (
  <span className="cli-command-wrapper" data-testid="cli-command-wrapper" key={Math.random()}>
    {command}
  </span>
)

// const wbSummaryCommand = (command: string, db?: number) => (
//   <span
//     className="cli-command-wrapper"
//     data-testid="wb-command"
//   >
//     {`${getDbIndex(db)} > ${command} \n`}
//   </span>
// )

const clearOutput = () => {
  useCliOutputStore.getState().resetOutput()
}

// const cliParseCommandsGroupResult = (
//   result: IGroupModeCommand,
//   db?: number,
// ) => {
//   const executionCommand = wbSummaryCommand(result.command, db)

//   let executionResult = []
//   if (result.status === CommandExecutionStatus.Success) {
//     executionResult = formatToText(replaceEmptyValue(result.response), result.command).split('\n')
//   } else {
//     executionResult = [cliParseTextResponse(result.response || '(nil)', result.command, result.status)]
//   }

//   return [executionCommand, ...executionResult]
// }

const updateCliHistoryStorage = (
  command: string = '',
) => {
  if (!command) {
    return
  }
  const maxCountCommandHistory = 20

  const commandHistoryPrev = localStorageService.get(StorageItem.cliInputHistory) ?? []

  const commandHistory = [command?.trim()]
    .concat(commandHistoryPrev)
    .slice(0, maxCountCommandHistory)

  localStorageService.set(
    StorageItem.cliInputHistory,
    commandHistory.slice(0, maxCountCommandHistory),
  )

  useCliOutputStore.getState().updateCliCommandHistory?.(commandHistory)
}

const checkUnsupportedCommand = (unsupportedCommands: string[], commandLine: string) =>
  unsupportedCommands?.find((command) =>
    commandLine?.trim().toLowerCase().startsWith(command?.toLowerCase()))

const checkBlockingCommand = (blockingCommands: string[], commandLine: string) =>
  blockingCommands?.find((command) => commandLine?.trim().toLowerCase().startsWith(command))

// const checkCommandModule = (command: string) => {
//   switch (true) {
//     case command.startsWith(ModuleCommandPrefix.RediSearch): {
//       return RedisDefaultModules.Search
//     }
//     case command.startsWith(ModuleCommandPrefix.JSON): {
//       return RedisDefaultModules.ReJSON
//     }
//     case command.startsWith(ModuleCommandPrefix.TimeSeries): {
//       return RedisDefaultModules.TimeSeries
//     }
//     case command.startsWith(ModuleCommandPrefix.BF):
//     case command.startsWith(ModuleCommandPrefix.CF):
//     case command.startsWith(ModuleCommandPrefix.CMS):
//     case command.startsWith(ModuleCommandPrefix.TDIGEST):
//     case command.startsWith(ModuleCommandPrefix.TOPK): {
//       return RedisDefaultModules.Bloom
//     }
//     case command.startsWith(ModuleCommandPrefix.TriggersAndFunctions): {
//       return RedisDefaultModules.RedisGears
//     }
//     default: {
//       return null
//     }
//   }
// }

// const checkUnsupportedModuleCommand = (loadedModules: AdditionalRedisModule[], commandLine: string) => {
//   const command = commandLine?.trim().toUpperCase()

//   const commandModule = checkCommandModule(command)
//   if (!commandModule) {
//     return null
//   }
//   const isModuleLoaded = loadedModules?.some(({ name }) =>
//     COMMAND_MODULES[commandModule].some((module) => name === module))

//   if (isModuleLoaded) {
//     return null
//   }

//   return commandModule
// }

const getDbIndexFromSelectQuery = (query: string): number => {
  const [command, ...args] = query.trim().split(' ')
  if (command.toLowerCase() !== SelectCommand.toLowerCase()) {
    throw new Error('Invalid command')
  }
  try {
    return parseInt(args[0].replace(/['"]/g, '').trim())
  } catch (e) {
    throw Error('Parsing error')
  }
}

// const getCommandNameFromQuery = (
//   query: string,
//   commandsSpec: ICommands = {},
//   queryLimit: number = 50,
// ): string | undefined => {
//   try {
//     const [command, firstArg] = query.slice(0, queryLimit).trim().split(/\s+/)
//     if (commandsSpec[`${command} ${firstArg}`.toUpperCase()]) return `${command} ${firstArg}`
//     return command
//   } catch (error) {
//     return undefined
//   }
// }

// const DEPRECATED_MODULE_PREFIXES = [
//   ModuleCommandPrefix.Graph,
// ]

const DEPRECATED_MODULE_GROUPS = [
  CommandGroup.Graph,
]

// const checkDeprecatedModuleCommand = (command: string) =>
//   DEPRECATED_MODULE_PREFIXES.some((prefix) => command.toUpperCase().startsWith(prefix))

const checkDeprecatedCommandGroup = (item: string) =>
  DEPRECATED_MODULE_GROUPS.some((group) => group === item)

// const removeDeprecatedModuleCommands = (commands: string[]) => commands
//   .filter((command) => !checkDeprecatedModuleCommand(command))

export {
  // cliParseTextResponse,
  cliParseTextResponseWithOffset,
  // cliParseCommandsGroupResult,
  cliCommandOutput,
  // bashTextValue,
  // cliCommandWrapper,
  clearOutput,
  updateCliHistoryStorage,
  // checkCommandModule,
  checkUnsupportedCommand,
  checkBlockingCommand,
  // checkUnsupportedModuleCommand,
  getDbIndexFromSelectQuery,
  // getCommandNameFromQuery,
  // wbSummaryCommand,
  replaceEmptyValue,
  // removeDeprecatedModuleCommands,
  // checkDeprecatedModuleCommand,
  checkDeprecatedCommandGroup,
}
