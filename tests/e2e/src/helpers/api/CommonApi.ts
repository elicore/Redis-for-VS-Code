import * as request from 'supertest'
import { Common } from '../Common'

const endpoint = Common.getEndpoint()
const jsonType = 'application/json'

export class CommonAPIRequests {
  /**
   * Send GET request using API
   * @param resourcePath URI path segment
   */
  static async sendGetRequest(resourcePath: string): Promise<any> {
    let requestEndpoint: any

    requestEndpoint = request(endpoint)
      .get(resourcePath)
      .set('Accept', jsonType)

    return requestEndpoint
  }

  /**
   * Send POST request using API
   * @param resourcePath URI path segment
   * @param body Request body
   */
  static async sendPostRequest(
    resourcePath: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let requestEndpoint: any

    requestEndpoint = request(endpoint)
      .post(resourcePath)
      .send(body)
      .set('Accept', jsonType)

    return requestEndpoint
  }

  /**
   * Send DELETE request using API
   * @param resourcePath URI path segment
   * @param body Request body
   */
  static async sendDeleteRequest(
    resourcePath: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let requestEndpoint: any

    requestEndpoint = request(endpoint)
      .delete(resourcePath)
      .send(body)
      .set('Accept', jsonType)

    return requestEndpoint
  }
}