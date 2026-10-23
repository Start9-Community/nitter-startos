export const uiPort = 8080

export const uiUsername = 'admin'

// Paths inside the nitter container (the 'main' volume is mounted at /data)
export const nitterConfPath = '/data/nitter.conf'
export const sessionsJsonlPath = '/data/sessions.jsonl'
