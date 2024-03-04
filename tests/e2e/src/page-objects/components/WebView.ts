import { By, WebElement, until, Locator } from 'selenium-webdriver'
import { VSBrowser, WebDriver } from 'vscode-extension-tester'

/**
 * Returns a class that has the ability to access a webview.
 */
export class WebView {
  protected driver: WebDriver
  private handle: string | undefined

  iframeBody = By.xpath('//*[@class="vscode-dark"]')

  constructor() {
    this.driver = VSBrowser.instance.driver
  }

  /**
   * Search for an element inside the webview iframe.
   * Requires webdriver being switched to the webview iframe first.
   * (Will attempt to search from the main DOM root otherwise)
   * @param locator webdriver locator to search by
   * @returns promise resolving to WebElement when found
   */
  async findWebElement(locator: Locator): Promise<WebElement> {
    return await this.driver.findElement(locator)
  }

  /**
   * Search for all element inside the webview iframe by a given locator
   * Requires webdriver being switched to the webview iframe first.
   * (Will attempt to search from the main DOM root otherwise)
   * @param locator webdriver locator to search by
   * @returns promise resolving to a list of WebElement objects
   */
  async findWebElements(locator: Locator): Promise<WebElement[]> {
    return await this.driver.findElements(locator)
  }

  /**
   * Switch the underlying webdriver context to the webview iframe.
   * @param locator webdriver locator to search by
   * @param timeout optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Promise resolving when switched to WebView iframe
   */
  async switchToFrame(
    switchView: Views,
    switchSecondView?: Views,
    timeout: number = 10000,
  ): Promise<void> {
    const frameLocator = ViewLocators[switchView]
    await this.driver.wait(
      until.elementLocated(By.xpath(frameLocator)),
      timeout,
    )
    const firstView = await this.findWebElement(By.xpath(frameLocator))
    await this.driver.switchTo().frame(firstView)

    if (switchSecondView) {
      const secondFrameLocator = ViewLocators[switchSecondView]
      await this.driver.wait(
        until.elementLocated(By.xpath(secondFrameLocator)),
        timeout,
      )
      const secondView = await this.findWebElement(By.xpath(secondFrameLocator))
      await this.driver.switchTo().frame(secondView)
    } else {
      await this.driver.switchTo().frame(0)
    }

    const elementLocator = ViewElements[switchView]
    await this.driver.wait(
      until.elementLocated(By.xpath(elementLocator)),
      timeout,
    )
  }

  /**
   * Switch the underlying webdriver back to the original window
   */
  async switchBack(): Promise<void> {
    if (!this.handle) {
      this.handle = await this.driver.getWindowHandle()
    }
    return await this.driver.switchTo().window(this.handle)
  }
}

export enum Views {
  TreeView,
  KeyDetailsView,
  KeyDetailsSecondView,
  CliViewPanel,
  AddKeyView,
  DatabaseDetailsView,
}

export const ViewLocators = {
  [Views.TreeView]:
    "//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]",
  [Views.KeyDetailsView]:
    "//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe",
  [Views.KeyDetailsSecondView]: "//iframe[@title='RedisInsight - Key details']",
  [Views.CliViewPanel]:
    "//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)]",
  [Views.AddKeyView]:
    "//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe",
  [Views.DatabaseDetailsView]:
    "//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe",
}

export const ViewElements = {
  [Views.TreeView]: `//div[@data-testid='tree-view-page']`,
  [Views.KeyDetailsView]: `//*[@data-testid='key-details-page']`,
  [Views.KeyDetailsSecondView]: `//*[@data-testid='key-details-page']`,
  [Views.CliViewPanel]: `//*[@data-testid='panel-view-page']`,
  [Views.AddKeyView]: `//*[@data-testid='select-key-type']`,
  [Views.DatabaseDetailsView]: `//*[contains(@data-testid,  'database-') and contains(@data-testid,  '-page')]`,
}
