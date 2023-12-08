import { By } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'

/**
 * key tree list view
 */
export class KeyTreeView extends BaseComponent {
  // frame locator
  static treeFrame =
    By.xpath(`(//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)])[2]
`)

  // mask
  keyMask = '//*[@data-testid="key-$name"]'

  constructor() {
    super(KeyTreeView.treeFrame)
  }

  /**
   * Open key details of the key by name
   * @param keyName The name of the key
   */
  async openKeyDetailsByKeyName(name: string): Promise<void> {
    const keyNameInTheListLocator = By.xpath(
      this.keyMask.replace(/\$name/g, name),
    )
    const keyNameInTheListElement = await this.getElement(
      keyNameInTheListLocator,
    )
    await keyNameInTheListElement.click()
  }
}
