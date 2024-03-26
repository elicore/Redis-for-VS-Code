import { By, Locator } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'
import { ViewElements, Views } from '@e2eSrc/page-objects/components/WebView'
import { ButtonActions } from '@e2eSrc/helpers/common-actions'

/**
 * Tree list view with databases and keys
 */
export class TreeView extends BaseComponent {
  treeViewPage = By.xpath(`//div[@data-testid='tree-view-page']`)
  scanMoreBtn = By.xpath(`//vscode-button[@data-testid='scan-more']`)
  treeViewKey = By.xpath(
    `//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')]`,
  )
  keyStarts = By.xpath(`//div[starts-with(@data-testid, 'key-')]`)
  refreshButton = By.xpath(`//vscode-button[@data-testid='refresh-keys']`)
  addKeyButton = By.xpath(`//vscode-button[@data-testid='add-key-button']`)
  sortKeysBtn = By.xpath(`//vscode-button[@data-testid='sort-keys']`)
  addDatabaseBtn = By.xpath(`//a[@aria-label='Add Redis database']`)
  editDatabaseBtn = By.xpath(`//vscode-button[@data-testid='edit-database']`)
  settingsButton = By.xpath(`//a[@aria-label='Open RedisInsight settings']`)
  deleteKeyInListBtn = By.xpath(
    `//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  submitDeleteKeyButton = By.xpath(
    `//div[@class='popup-content ']//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  // mask
  keyMask = '//*[@data-testid="key-$name"]'
  getItemDeleteButton = (keyName: string): Locator =>
    By.xpath(
      `//vscode-button[starts-with(@data-testid, 'remove-key-${keyName}')]`,
    )
  getTreeViewItemByIndex = (index: number): Locator =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')])[${index}]`,
    )
  getTreeViewItemByName = (name: string): Locator =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-${name}')])`,
    )
  getKey = (base: string): Locator =>
    By.xpath(`//div[starts-with(@data-testid, '${base}')]`)
  getFolderSelectorByName = (folderName: string): Locator => {
    return By.xpath(
      `//div[starts-with(@data-testid, 'node-item_${folderName}')]`,
    )
  }
  getFolderNameSelectorByNameAndIndex = (
    folderName: string,
    index: number,
  ): Locator => {
    return By.xpath(
      `(//div[starts-with(@data-testid, 'node-item_${folderName}')])[${index}]//*[starts-with(@data-testid, 'folder-')]`,
    )
  }
  getDatabaseByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/..`,
    )
  getEditDatabaseBtnByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/..//vscode-button[@data-testid='edit-database']`,
    )
  getRefreshDatabaseBtnByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/..//vscode-button[@data-testid = 'refresh-keys']`,
    )
  getKeySelectorByName = (name: string): Locator =>
    By.xpath(`//*[@data-testid="key-${name}"]`)
  getNotPatternedKeyByName = (name: string): Locator =>
    By.xpath(
      `//div[starts-with(@data-testid, 'node-item_${name}') and .//div[starts-with(@data-testid, 'key-')]]`,
    )
  getLimitedTreeViewKeys = (number: number): Locator =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')])[position() <= ${number}]`,
    )

  constructor() {
    super(By.xpath(ViewElements[Views.TreeView]))
  }

  /**
   * Open key details of the key by name
   * @param keyName The name of the key
   */
  async openKeyDetailsByKeyName(name: string): Promise<void> {
    const keyNameInTheListElement = await this.getElement(
      this.getKeySelectorByName(name),
    )
    await keyNameInTheListElement.click()
  }

  /**
   * Open tree folder with multiple level
   * @param names folder names with sequence of subfolder
   */
  async openTreeFolders(names: string[]): Promise<void> {
    let base = `node-item_${names[0]}:`
    await this.clickElementIfNotExpanded(base)
    if (names.length > 1) {
      for (let i = 1; i < names.length; i++) {
        base = `${base}${names[i]}:`
        await this.clickElementIfNotExpanded(base)
      }
    }
  }

  /**
   * Check whether Element is expanded
   * @param baseSelector the base element selector
   * * @returns Promise resolving to true if element is expanded
   */
  async verifyElementExpanded(baseSelector: Locator): Promise<boolean> {
    const elementSelector = await (
      await this.getElement(baseSelector)
    ).getAttribute('data-testid')
    return elementSelector?.includes('expanded')
  }

  /**
   * Click on the folder element if it is not expanded
   * @param base the base element
   */
  private async clickElementIfNotExpanded(base: string): Promise<void> {
    const baseSelector = this.getKey(base)
    if (!(await this.verifyElementExpanded(baseSelector))) {
      await (await this.getElement(baseSelector)).click()
    }
  }

  /**
   * Get all keys from tree view list with order
   */
  async getAllKeysArray(): Promise<string[]> {
    const textArray: string[] = []
    const treeViewItemElements = this.treeViewKey
    const itemCount = (
      await this.getDriver().findElements(treeViewItemElements)
    ).length

    for (let i = 1; i <= itemCount; i++) {
      const treeItemElement = await this.getDriver().findElement(
        this.getTreeViewItemByIndex(i),
      )
      textArray.push(await treeItemElement.getText())
    }

    return textArray
  }

  /**
   * Delete first Key in list after Hovering
   */
  async deleteFirstKeyFromList(): Promise<void> {
    await ButtonActions.hoverElement(this.treeViewKey)
    await (await this.getElement(this.deleteKeyInListBtn)).click()
    await (await this.getElement(this.submitDeleteKeyButton)).click()
  }

  /**
   * Delete first Key in list after Hovering
   */
  async deleteKeyFromListByName(keyName: string): Promise<void> {
    await ButtonActions.hoverElement(this.getTreeViewItemByName(keyName))
    await (await this.getElement(this.getItemDeleteButton(keyName))).click()
    await (await this.getElement(this.submitDeleteKeyButton)).click()
  }

  /**
   * Click on database in list by name to expand or collapse it
   * @param databaseName The name of the database
   */
  async clickDatabaseByName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(this.getDatabaseByName(databaseName))
  }

  /**
   * Click on edit database in list by its name
   * @param databaseName The name of the database
   */
  async editDatabaseByName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(
      this.getEditDatabaseBtnByName(databaseName),
    )
  }

  /**
   * Click on refresh database in list by its name
   * @param databaseName The name of the database
   */
  async refreshDatabaseByName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(
      this.getRefreshDatabaseBtnByName(databaseName),
    )
  }

  /**
   * Verifying if the Key is in the List of keys
   * @param keyName The name of the key
   */
  async isKeyIsDisplayedInTheList(keyName: string): Promise<boolean> {
    const keyNameInTheList = this.getKeySelectorByName(keyName)
    return await this.isElementDisplayed(keyNameInTheList)
  }
}
