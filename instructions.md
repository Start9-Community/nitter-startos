# Nitter

> **You need an X account.** X removed all anonymous access, so every Nitter instance needs session cookies from a real, logged-in X account. Use a burner account: X may restrict or suspend accounts used for scraping. A fresh account works fine — it does not need followers or a verified phone number (email is usually enough).

## Documentation

- [Nitter on GitHub](https://github.com/zedeus/nitter) — the upstream project's README and documentation.

## Getting Set Up

### 1. Choose private or public

Nitter asks you to run **Manage Access** before it starts.

- **Private**, the default, asks for a username and password, in your browser and in RSS readers. The username is always `admin`. The password is generated for you and shown only once, so save it.
- **Public** lets anyone who can reach one of Nitter's addresses use it, and every page they open is fetched with your X account.

### 2. Get your session cookies

1. In a desktop browser, log in to <https://x.com> with your (burner) account.
2. Open the browser's developer tools (`F12`) and find the cookies for `x.com`:
   - **Firefox:** Storage tab → Cookies → `https://x.com`
   - **Chrome/Brave:** Application tab → Cookies → `https://x.com`
3. Copy the values of these two cookies:
   - `auth_token`
   - `ct0`

Keep the browser session logged in — logging out invalidates the cookies.

### 3. Add the session to Nitter

1. Run **Add X Account Session** and paste the two cookie values. The username field is optional and only labels the session.
2. Start the service.

You can add multiple sessions from different accounts — Nitter spreads requests across them, which helps avoid rate limits.

### 4. Open the web UI

Open the **Web UI** from Nitter's Dashboard tab. Search for any account (e.g. `elonmusk`) to confirm data loads.

## RSS Feeds

Every profile, search, and list has an RSS feed — append `/rss` to the URL (e.g. `/<username>/rss`). Feed links are generated from your **primary URL**. Nitter asks you to choose one with **Set Primary URL**; run it again if you read feeds from a different address (e.g. Tor).

While Nitter is private, RSS readers need the username and password too. Most support Basic Auth natively or via `https://admin:password@your-address/...` URLs.

## Private or Public

Run **Manage Access** at any time to switch between private and public.

- Choosing **Private** again keeps your current password. Turn on **Generate a new password** to replace it; the old one then stops working everywhere, including in RSS readers.
- **Tor addresses:** an onion address added without SSL skips the login, and that is Tor's default for a web interface. To keep a private Nitter private over Tor, turn on SSL when you add the onion address. Tor Browser then shows a certificate warning.

## Display Preferences

Theme, media, and layout preferences live on Nitter's own `/settings` page (the gear icon). They are stored per-browser in cookies, not on the server.

## Troubleshooting

- **Pages show errors or "no sessions" messages:** your session was likely invalidated (logged out, password change, or X-side restriction). Run **Remove X Account Sessions**, then **Add X Account Session** with fresh cookies.
- **Rate limit errors:** add one or more additional sessions from other accounts.
- **The service won't start after install:** complete the **Manage Access** and **Add X Account Session** tasks first.
- **Lost the password:** run **Manage Access**, choose **Private** and turn on **Generate a new password**.
