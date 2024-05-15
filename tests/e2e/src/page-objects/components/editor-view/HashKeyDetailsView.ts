import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/editor-view/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'

/**
 * Hash Key details view
 */
export class HashKeyDetailsView extends DoubleColumnKeyDetailsView {
  hashFieldValueEditor = By.xpath(`//*[@data-testid = 'hash-value-editor']`)
  hashFieldsList = By.xpath(
    `//*[contains(@data-testid, 'hash-field-') and not(contains(@data-testid,'value'))]/div`,
  )
  hashValuesList = By.xpath(`//*[contains(@data-testid, 'hash-field-value-')]`)
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'hash-field-value-')]//*[@class = 'truncate']`,
  )
  addHashFieldPanel = By.xpath(`//*[@data-testid = 'add-hash-field-panel']`)
  hashFieldInput = By.xpath(
    `//*[@data-testid = 'add-hash-field-panel']//*[contains(@data-testid, 'hash-field-')]`,
  )
  hashValueInput = By.xpath(
    `//*[@data-testid = 'add-hash-field-panel']//*[contains(@data-testid, 'hash-value-')]`,
  )
  saveHashFieldButton = By.xpath(`//*[@data-testid = 'save-fields-btn']`)

  /**
   * Edit Hash key value from details
   * @param value The value of the key
   * @param name The field value
   */
  async editHashKeyValue(value: string, name: string = ''): Promise<void> {
    await super.editKeyValue(
      value,
      name,
      this.hashFieldValueEditor,
      KeyTypesShort.Hash,
    )
  }

  /**
   * Add field to hash key
   * @param keyFieldValue The value of the hash field
   * @param keyValue The hash value
   */
  async addFieldToHash(keyFieldValue: string, keyValue: string): Promise<void> {
    await ButtonActions.clickElement(this.addKeyValueItemsButton)
    await InputActions.typeText(this.hashFieldInput, keyFieldValue)
    await InputActions.typeText(this.hashValueInput, keyValue)
    await ButtonActions.clickElement(this.saveHashFieldButton)
  }
}