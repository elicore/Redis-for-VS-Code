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
  async switchToFrame(locator: Locator, timeout: number = 5000): Promise<void> {
    const view = await this.driver.findElement(locator)

    await this.driver.switchTo().frame(view)
    await this.driver.switchTo().frame(0)

    await this.driver.wait(until.elementLocated(this.iframeBody), timeout)
    await this.findWebElement(this.iframeBody)
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