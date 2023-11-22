import { By } from 'selenium-webdriver'
import { Workbench, BottomBarPanel } from 'vscode-extension-tester'
import { CliView } from './Views'
import { AbstractElement } from '../AbstractElement'

export class BottomBar extends AbstractElement {
  constructor() {
    super(By.id('workbench.parts.panel'))
  }
  tabContainer = By.className('composite title has-composite-bar')
  tab = (title: string) => By.xpath(`.//li[starts-with(@title, '${title}')]`)
  label = (title: string) =>
    By.xpath(`.//a[starts-with(@aria-label, '${title}')]`)
  actions = By.className('title-actions')
  globalActions = By.className('title-actions')
  action = (label: string) => By.xpath(`.//a[starts-with(@title, '${label}')]`)
  closeAction = By.className('codicon-panel-close')

  /**
   * Open the CLI view in the bottom panel
   * @returns Promise resolving to CLIView object
   */
  async openCliView(): Promise<CliView> {
    console.log('before opening tab RedisInsight')
    await this.openTab('RedisInsight CLI')
    return new CliView(this).wait()
  }

  private async openTab(title: string) {
    await new BottomBarPanel().toggle(true)
    console.log('before finding element')
    const tabContainer = await this.findElement(this.tabContainer)
    try {
      const tabs = await tabContainer.findElements(this.tab(title))
      if (tabs.length > 0) {
        await tabs[0].click()
      } else {
        const label = await tabContainer.findElement(this.label(title))
        await label.click()
      }
    } catch (err) {
      await new Workbench().executeCommand(`${title}: Focus on ${title} View`)
    }
  }
}
