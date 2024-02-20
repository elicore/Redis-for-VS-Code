import { expect } from 'chai'
import { By } from 'vscode-extension-tester'
import {
  WebView,
  TreeView,
  DatabaseDetailsView,
} from '@e2eSrc/page-objects/components'
import { ViewElements, Views } from '@e2eSrc/page-objects/components/WebView'
import { CommonDriverExtension } from '@e2eSrc/helpers/CommonDriverExtension'

/**
 * Key details actions
 */
export class KeyDetailsActions extends CommonDriverExtension {
  /**
   * Open key details of the key by name in iframe
   * @param keyName The name of the key
   */
  static async openKeyDetailsByKeyNameInIframe(name: string): Promise<void> {
    let webView = new WebView()
    let treeView = new TreeView()
    await this.driverSleep(1000)
    await treeView.openKeyDetailsByKeyName(name)
    await this.driverSleep(2000)
    await webView.switchBack()
    await webView.switchToFrame(Views.KeyDetailsView)
  }

  /**
   * Verify that details panel is closed
   */
  static async verifyDetailsPanelClosed(): Promise<void> {
    expect(
      await new DatabaseDetailsView().isElementDisplayed(
        By.xpath(ViewElements[Views.DatabaseDetailsView]),
      ),
    ).false
  }
}
