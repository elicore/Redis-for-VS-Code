import { expect } from 'chai'
import { describe, it, afterEach } from 'mocha'
import {
  BottomBar,
  CliViewPanel,
  StringKeyDetailsView,
  TreeView,
  HashKeyDetailsView,
  SortedSetKeyDetailsView,
  ListKeyDetailsView,
  SetKeyDetailsView,
  JsonKeyDetailsView,
} from '@e2eSrc/page-objects/components'
import { Common } from '@e2eSrc/helpers/Common'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  ButtonActions,
  DatabasesActions,
  InputActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { AddStringKeyView } from '@e2eSrc/page-objects/components/editor-view/AddStringKeyView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import { JsonKeyParameters } from '@e2eSrc/helpers/types/types'

const keyTTL = '2147476121'
const expectedTTL = /214747612*/
let keyName: string

describe('Key Details verifications', () => {
  let bottomBar: BottomBar
  let cliViewPanel: CliViewPanel
  let keyDetailsView: StringKeyDetailsView
  let treeView: TreeView
  let stringKeyDetailsView: StringKeyDetailsView
  let hashKeyDetailsView: HashKeyDetailsView
  let sortedSetKeyDetailsView: SortedSetKeyDetailsView
  let listKeyDetailsView: ListKeyDetailsView
  let setKeyDetailsView: SetKeyDetailsView
  let jsonKeyDetailsView: JsonKeyDetailsView
  let addStringKeyView: AddStringKeyView

  before(async () => {
    bottomBar = new BottomBar()
    keyDetailsView = new StringKeyDetailsView()
    stringKeyDetailsView = new StringKeyDetailsView()
    treeView = new TreeView()
    hashKeyDetailsView = new HashKeyDetailsView()
    sortedSetKeyDetailsView = new SortedSetKeyDetailsView()
    listKeyDetailsView = new ListKeyDetailsView()
    setKeyDetailsView = new SetKeyDetailsView()
    jsonKeyDetailsView = new JsonKeyDetailsView()
    addStringKeyView = new AddStringKeyView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  afterEach(async () => {
    await keyDetailsView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await KeyAPIRequests.deleteKeyByNameApi(
      keyName,
      Config.ossStandaloneConfig.databaseName,
    )
  })

  after(async () => {
    await keyDetailsView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })

  it('Verify that user can see string details', async function () {
    const ttlValue = '2147476121'
    const expectedTTL = /214747612*/
    const testStringValue = 'stringValue'
    keyName = Common.generateWord(20)

    await treeView.switchBack()
    await ButtonActions.clickElement(treeView.addKeyButton)
    await treeView.switchToInnerViewFrame(InnerViews.AddKeyInnerView)
    await addStringKeyView.selectKeyTypeByValue(KeyTypesShort.String)
    await InputActions.typeText(addStringKeyView.ttlInput, ttlValue)
    await InputActions.typeText(
      addStringKeyView.stringValueInput,
      testStringValue,
    )

    const isDisabled = await addStringKeyView.isElementDisabled(
      addStringKeyView.addButton,
      'class',
    )
    expect(isDisabled).true

    await InputActions.typeText(addStringKeyView.keyNameInput, keyName)

    await ButtonActions.clickElement(addStringKeyView.addButton)
    await addStringKeyView.switchBack()
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)

    // check the key details
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const keyType = await keyDetailsView.getElementText(
      stringKeyDetailsView.keyType,
    )
    const enteredKeyName = await InputActions.getInputValue(
      stringKeyDetailsView.keyNameInput,
    )
    const keySize = await stringKeyDetailsView.getKeySize()
    const keyLength = await stringKeyDetailsView.getKeyLength()
    const keyTtl = Number(
      await InputActions.getInputValue(keyDetailsView.inlineItemEditor),
    )
    const keyValue = await stringKeyDetailsView.getElementText(
      stringKeyDetailsView.stringKeyValueInput,
    )

    await stringKeyDetailsView.clickCopyKeyName()
    const clipboard = await navigator.clipboard.read()
    expect(clipboard).contain(keyName, 'Name is not copied to clipboard')

    expect(keyType).contain('String', 'Type is incorrect')
    expect(enteredKeyName).eq(keyName, 'Name is incorrect')
    expect(keySize).greaterThan(0, 'Size is 0')
    expect(keyLength).greaterThan(0, 'Length is 0')
    expect(keyTtl).match(expectedTTL, 'The Key TTL is incorrect')
    expect(keyValue).eq(testStringValue, 'Value is incorrect')
  })

  it('Verify that user can see Hash Key details', async function () {
    keyName = Common.generateWord(10)
    await treeView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)

    const command = `HSET ${keyName} \"\" \"\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${keyTTL}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await cliViewPanel.switchBack()
    await bottomBar.toggle(false)

    // Refresh database
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    const keyType = await hashKeyDetailsView.getElementText(
      hashKeyDetailsView.keyType,
    )
    const enteredKeyName = await InputActions.getInputValue(
      stringKeyDetailsView.keyNameInput,
    )
    const keySize = await hashKeyDetailsView.getKeySize()
    const keyLength = await hashKeyDetailsView.getKeyLength()
    const keyTtl = Number(
      await InputActions.getInputValue(keyDetailsView.inlineItemEditor),
    )

    expect(keyType).contains('Hash', 'Type is incorrect')
    expect(enteredKeyName).eq(keyName, 'Name is incorrect')
    expect(keySize).greaterThan(0, 'Size is 0')
    expect(keyLength).greaterThan(0, 'Length is 0')
    expect(keyTtl).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see Sorted Set Key details', async function () {
    keyName = Common.generateWord(20)
    const value = 'value'
    const score = 1

    await treeView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)

    const command = `ZADD ${keyName} ${score} \"${value}\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${keyTTL}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await cliViewPanel.switchBack()
    await bottomBar.toggle(false)

    // Refresh database
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await sortedSetKeyDetailsView.getElementText(
        sortedSetKeyDetailsView.keyType,
      ),
    ).contain('Sorted Set', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(stringKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await sortedSetKeyDetailsView.getKeySize()).greaterThan(
      0,
      'Size is 0',
    )
    expect(await sortedSetKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(
      Number(await InputActions.getInputValue(keyDetailsView.inlineItemEditor)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })

  it('Verify that user can see List Key details', async function () {
    keyName = Common.generateWord(20)
    const ttl = '121212'
    const element = 'element1'

    await treeView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)

    const command = `LPUSH ${keyName} \"${element}\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${ttl}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await cliViewPanel.switchBack()
    await bottomBar.toggle(false)

    // Refresh database
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await listKeyDetailsView.getElementText(listKeyDetailsView.keyType),
    ).contain('List', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(stringKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await listKeyDetailsView.getKeySize()).greaterThan(0, 'Size is 0')
    expect(await listKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(
      Number(await InputActions.getInputValue(keyDetailsView.inlineItemEditor)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })
  it('Verify that user can see Set Key details', async function () {
    keyName = Common.generateWord(20)
    const value = 'value'

    await treeView.switchBack()
    cliViewPanel = await bottomBar.openCliViewPanel()
    await cliViewPanel.switchToInnerViewFrame(InnerViews.CliInnerView)

    const command = `SADD ${keyName} \"${value}\"`
    await cliViewPanel.executeCommand(`${command}`)
    const command2 = `expire ${keyName} \"${keyTTL}\" `
    await cliViewPanel.executeCommand(`${command2}`)
    await cliViewPanel.switchBack()
    await bottomBar.toggle(false)

    // Refresh database
    await treeView.switchToInnerViewFrame(InnerViews.TreeInnerView)
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await setKeyDetailsView.getElementText(setKeyDetailsView.keyType),
    ).contain('Set', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(stringKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await setKeyDetailsView.getKeySize()).greaterThan(0, 'Size is 0')
    expect(await setKeyDetailsView.getKeyLength()).greaterThan(0, 'Length is 0')
    expect(
      Number(await InputActions.getInputValue(keyDetailsView.inlineItemEditor)),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })
  it('Verify that user can see JSON Key details', async function () {
    keyName = Common.generateWord(20)
    const jsonValue =
      '{"employee":{ "name":"John", "age":30, "city":"New York" }}'
    const jsonKeyParameters: JsonKeyParameters = {
      keyName: keyName,
      data: jsonValue,
    }
    await KeyAPIRequests.addJsonKeyApi(
      jsonKeyParameters,
      Config.ossStandaloneConfig.databaseName,
    )

    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    expect(
      await jsonKeyDetailsView.getElementText(jsonKeyDetailsView.keyType),
    ).contain('JSON', 'Type is incorrect')
    expect(
      await InputActions.getInputValue(jsonKeyDetailsView.keyNameInput),
    ).eq(keyName, 'Name is incorrect')
    expect(await jsonKeyDetailsView.getKeySize()).greaterThan(0, 'Size is 0')
    expect(await jsonKeyDetailsView.getKeyLength()).greaterThan(
      0,
      'Length is 0',
    )
    expect(
      Number(
        await InputActions.getInputValue(jsonKeyDetailsView.inlineItemEditor),
      ),
    ).match(expectedTTL, 'The Key TTL is incorrect')
  })
})
