import { Chance } from 'chance'
import { Config } from './Conf'

const chance = new Chance()

export class Common {
  /**
   * Return api endpoint with disabled certificate validation
   */
  static getEndpoint(): string {
    return Config.apiUrl
  }

  /**
   * Generate word by number of symbols
   * @param number The number of symbols
   */
  static generateWord(number: number): string {
    return chance.word({ length: number })
  }

  /**
   * Generate sentence by number of words
   * @param number The number of words
   */
  static generateSentence(number: number): string {
    return chance.sentence({ words: number })
  }

  /**
   * Helper function to work with arr.filter() method with async functions
   * @param array The array
   * @param callback The callback function need to be processed
   */
  static async asyncFilter(
    array: string[],
    callback: (item: any) => Promise<boolean>,
  ): Promise<any[]> {
    const fail = Symbol()
    return (
      await Promise.all(
        array.map(async item => ((await callback(item)) ? item : fail)),
      )
    ).filter(i => i !== fail)
  }

  /**
   * Helper function to work with arr.find() method with async functions
   * @param array The array
   * @param asyncCallback The callback function need to be processed
   */
  static async asyncFind(
    array: string[],
    asyncCallback: (item: any) => Promise<boolean>,
  ): Promise<string> {
    const index = (await Promise.all(array.map(asyncCallback))).findIndex(
      result => result,
    )
    return array[index]
  }

  /**
   * Helper function for waiting until promise be resolved
   */
  static doAsyncStuff(): Promise<void> {
    return Promise.resolve()
  }
}