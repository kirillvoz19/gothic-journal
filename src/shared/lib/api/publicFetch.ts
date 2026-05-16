import { getApiUrl, getSupabaseRequestHeaders } from './baseUrl'

export const publicFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(getApiUrl(path), {
    ...options,
    headers: {
      ...options.headers,
      ...getSupabaseRequestHeaders(),
    },
  })
}
