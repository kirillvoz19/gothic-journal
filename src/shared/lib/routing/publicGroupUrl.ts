export const buildPublicGroupViewUrl = (groupId: number): string => {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${basePath}/#/groups/${groupId}/view`
}
