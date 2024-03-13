import { expect } from 'chai'
import { DatabaseAPIRequests, KeyAPIRequests } from '@e2eSrc/helpers/api'
import { Common } from '@e2eSrc/helpers/Common'
import { Config } from '@e2eSrc/helpers/Conf'
import {
  WebView,
  StringKeyDetailsView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import {
  DatabasesActions,
  KeyDetailsActions,
} from '@e2eSrc/helpers/common-actions'
import { Views } from '@e2eSrc/page-objects/components/WebView'

describe('Actions with Key List', () => {
  let webView: WebView
  let keyDetailsView: StringKeyDetailsView
  let treeView: TreeView

  before(async () => {
    webView = new WebView()
    keyDetailsView = new StringKeyDetailsView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(
      Config.ossStandaloneConfig,
    )
  })
  after(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  afterEach(async () => {
    await webView.switchBack()
    await webView.switchToFrame(Views.TreeView)
  })

  it('Verify that key deleted properly from the list', async function () {
    // Adding a string key
    const keyName = Common.generateWord(10)
    const keyValue = Common.generateWord(10)
    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: keyName,
        value: keyValue,
      },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )

    let actualItemsArray = await treeView.getAllKeysArray()
    expect(actualItemsArray).contains(keyName, 'Key added properly')

    await treeView.deleteKeyFromListByName(keyName)
    expect(actualItemsArray.includes(keyName)).eql(
      false,
      'Key deleted from the list properly',
    )
  })

  it('Verify that key deleted properly from details', async function () {
    const keyName = Common.generateWord(10)
    const keyValue = Common.generateWord(10)
    await KeyAPIRequests.addStringKeyApi(
      {
        keyName: keyName,
        value: keyValue,
      },
      Config.ossStandaloneConfig.databaseName,
    )
    // Refresh database
    await treeView.refreshDatabaseByName(
      Config.ossStandaloneConfig.databaseName,
    )
    // Open key details iframe
    await KeyDetailsActions.openKeyDetailsByKeyNameInIframe(keyName)

    // Delete key from detailed view
    keyDetailsView.removeKeyFromDetailedView()
    expect(!keyDetailsView?.stringKeyValueInput).eql(
      true,
      'Detailed view closed after deleting',
    )
  })
})