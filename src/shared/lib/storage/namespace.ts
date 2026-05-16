/** Префикс ключей localStorage по base path (разные GitHub Pages на одном origin). */
const storageNamespace = (() => {
  const slug = import.meta.env.BASE_URL.replace(/^\/+|\/+$/g, '')
  return slug || 'app'
})()

export const getStorageKey = (suffix: string): string => `${storageNamespace}:${suffix}`
