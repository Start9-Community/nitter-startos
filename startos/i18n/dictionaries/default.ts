export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Nitter!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of Nitter': 5,

  // actions/addSession.ts
  'Must be a hexadecimal cookie value': 6,
  'auth_token cookie': 7,
  'The value of the "auth_token" cookie from a logged-in x.com browser session': 8,
  'ct0 cookie': 9,
  'The value of the "ct0" cookie from the same x.com browser session': 10,
  'Username (optional)': 11,
  'The X username the session belongs to. Only used to label the session for troubleshooting.': 12,
  'Must be a valid X username': 13,
  'Add X Account Session': 14,
  'Add session cookies from a logged-in X (Twitter) account. Nitter needs at least one session to fetch data. Use a burner account.': 15,
  'Session added': 16,
  'The session was saved. Nitter restarts automatically to load it if the service is running.': 17,

  // actions/removeSessions.ts
  'Sessions to remove': 18,
  'Sessions are labeled by username when provided, otherwise by their position in the list.': 19,
  'Session ${number}': 20,
  'Remove X Account Sessions': 21,
  'Remove stored X account sessions, e.g. after revoking a session or deleting the account.': 22,
  'Nitter cannot fetch any data without at least one session.': 23,
  'Sessions removed': 24,
  'The selected sessions were removed.': 25,
  'All sessions were removed. Add a new session so Nitter can fetch data.': 26,

  // actions/setPrimaryUrl.ts
  URL: 27,
  'Set Primary URL': 28,
  'Choose which of your Nitter URLs is used for generating links, such as RSS feed and canonical URLs.': 29,

  // actions/manageAccess.ts
  Access: 30,
  "- Private: Nitter asks for a username and password, in your browser and in RSS readers\n- Public: anyone who can reach one of Nitter's addresses can use it, and every page they open is fetched with your X sessions": 31,
  'Private (require login)': 32,
  'Generate a new password': 33,
  'Replace the current password. The old one stops working, including in RSS readers. A password is always generated the first time Nitter is made private.': 34,
  Public: 35,
  'Manage Access': 36,
  'Make Nitter private, so it asks for a username and password, or public. The username is always "admin".': 37,
  'Nitter is public': 38,
  "Anyone who can reach one of Nitter's addresses can use it without a login.": 39,
  'Login required': 40,
  'Nitter asks for a username and password. Your password has not changed.': 41,
  'Use these credentials when your browser or RSS reader asks for a login. This is the only time the password is shown.': 42,
  Username: 43,
  Password: 44,

  // init/taskSessions.ts
  'Nitter requires session cookies from a real X (Twitter) account to fetch data. Add a session to start the service.': 45,

  // init/taskAccess.ts
  'Choose whether Nitter asks for a username and password. Private is the default.': 46,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
