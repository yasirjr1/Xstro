import { fetchJson } from "../index.mts";
/**
 * External API for tools to manage resources and services.
 * Provides endpoints for handling various operations at https://bk9.fun/.
 * @see {@link https://bk9.fun/} for more information.
 */
export class endPointClient {
  private api_server: string

  constructor(api_server?: string) {
    if (!api_server) {
        this.api_server = 'https://bk9.fun'
    }
  }
  async deepSeek(query: string): Promise<string | undefined> {
    if (!query) return undefined;
    const getDeepSeekResponse = await fetchJson(`${this.api_server}/ai/deepseek-r1?q=${query}`)
    const jResult = JSON.parse(getDeepSeekResponse)
    console.log(jResult)
    return jResult.BK9.content as string
  }
}
