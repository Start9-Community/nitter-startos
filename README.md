<p align="center">
  <img src="icon.svg" alt="Nitter Logo" width="21%">
</p>

# Nitter on StartOS

> Everything not listed in this document should behave the same as upstream
> Nitter. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Nitter is a lightweight, JavaScript-free front-end for X (Twitter) — browse profiles, tweets, and searches without ads or tracking, and subscribe to accounts over RSS. The upstream project is [zedeus/nitter](https://github.com/zedeus/nitter). What this package adds on top of upstream is session management, a bundled cache, a managed primary URL, and a choice between private and public access; the rest of this file describes only those differences.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Two images run together: the upstream Nitter image and a Valkey cache, both published upstream and pinned by tag in the manifest. The Nitter image has its CA store upgraded by the root `Dockerfile`.

| Property      | Value                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| Images        | `zedeus/nitter` (CA store upgraded), `valkey/valkey`                        |
| Architectures | x86_64, aarch64                                                             |
| Entrypoint    | Nitter runs its default `./nitter` from `/src`; Valkey runs `valkey-server` |

The package runs two subcontainers, `valkey-sub` and `nitter-sub`, started in that order. Attach to one with `start-cli package attach nitter -n <subcontainer-name>`. Nitter serves the web interface itself, as its image's non-root user; Valkey is its cache, listening on loopback only. Nitter is pointed at its config and session files on the `main` volume through the `NITTER_CONF_FILE` and `NITTER_SESSIONS_FILE` environment variables rather than the image's baked-in defaults.

---

## Volume and Data Layout

A single volume, `main`, holds everything that persists; it is mounted into the Nitter subcontainer at `/data`. The Valkey subcontainer mounts no volume — the cache is deliberately ephemeral.

| Volume | Mount Point | Contents                                                       |
| ------ | ----------- | -------------------------------------------------------------- |
| `main` | `/data`     | `nitter.conf`, `sessions.json`, `sessions.jsonl`, `store.json` |

---

## File Models

The package manages four files on the `main` volume. Three are typed file models; the fourth is rendered from one of them on every start. A change to `nitter.conf` or `sessions.json` restarts the service, because Nitter reads both only at startup. A change to `store.json` restarts nothing by itself: the access choice applies at once, and the primary URL reaches Nitter through `nitter.conf`.

- **`nitter.conf`** — the upstream Nim `parsecfg` config. Created at install with upstream defaults plus a randomly generated `hmacKey`, and saved again at every init (each boot, update or restore), which fills in any missing key. Nitter reads this file directly, so a hand edit takes effect. Two caveats on ownership: `Server.hostname` / `Server.https` are rewritten at every init from the link URL (see [Network Access and Interfaces](#network-access-and-interfaces)), so a hand edit to them does not survive; and the keys that wire Nitter into StartOS are re-asserted on every save — `Server.address` (`0.0.0.0`), `Server.port` (`8080`), `Server.staticDir`, `Cache.redisHost`/`redisPort` (the Valkey endpoint), and `Config.enableDebug` (held off). Every other key is yours, including ones the package doesn't model, such as upstream's per-feed RSS switches or a `[Preferences]` section; a valid hand edit survives. Comments in the file are not kept.
- **`sessions.json`** — the source of truth for X account sessions, an array of `{ auth_token, ct0, username? }`. Written only by the Add / Remove Session actions, which replace the array wholesale; it is seeded empty. A hand edit is lost the next time either action runs.
- **`store.json`** — StartOS-only state with no upstream equivalent, not seeded at install:
  - `access`: `private` or `public`, written by **Manage Access**. Unset until the owner chooses, which is what raises the Manage Access task (see [Tasks](#tasks)).
  - `password`: the login password, in plaintext because StartOS's reverse proxy checks the login against it. Only Manage Access writes it, and it is kept when Nitter is made public, so making it private again can reuse it.
  - `primaryUrl`: the URL chosen in **Set Primary URL**.
  - `reattachTorOnions`: set while Tor still has to move the Web UI's `.onion` addresses from a retired port binding to port 8080, and cleared once it has.

- **`sessions.jsonl`** — not a model. Rendered from `sessions.json` into the file Nitter actually reads (`NITTER_SESSIONS_FILE`) on every start, one `{"kind":"cookie",…}` object per line. A hand edit is overwritten each start.

---

## Dependencies

None. Nitter needs an X account session (supplied through an action), not another StartOS service.

---

## Network Access and Interfaces

One interface, served by Nitter itself. StartOS's reverse proxy serves its HTTPS addresses and, while access is private, asks for the login there before a request reaches Nitter.

| Interface | ID   | Type | Port | Protocol | Purpose                                                 |
| --------- | ---- | ---- | ---- | -------- | ------------------------------------------------------- |
| Web UI    | `ui` | ui   | 8080 | HTTP     | The Nitter web interface and RSS feeds at `/<name>/rss` |

Nitter builds absolute links (RSS item links, the OpenSearch descriptor, embed and share links, page preview metadata) from `Server.hostname` and `Server.https` in `nitter.conf`, not from the address a request arrives on, so every reader of a feed gets links to the same URL, the link URL. It is the primary URL while that URL's hostname is one of the service's addresses, followed to the hostname's current port and scheme. Until a primary URL is chosen, and while the chosen one is gone, it is the preferred address instead: a public domain, HTTPS first, else the `.local` address, else the first one offered. **Open UI** opens the link URL, unless StartOS can tell the browser could not reach it.

---

## Installation and First-Run Flow

Nitter has no upstream setup wizard; StartOS does the first-run setup through init and tasks.

1. `nitter.conf` and `sessions.json` are seeded with their defaults, including a random `hmacKey`.
2. A **critical** task requires **Add X Account Session** before the service can start — Nitter cannot fetch anything without at least one session.
3. A **critical** task requires **Manage Access** before the service can start, with Private pre-selected, so Nitter never runs before the owner has chosen whether it asks for a login.
4. An **important** task asks for **Set Primary URL**, pre-filled with the preferred address, which Nitter links to until a URL is chosen.

See [Tasks](#tasks).

---

## Actions

All actions are available in any service status, and all are user-facing. Session cookies and the access password are write-only: no form is ever pre-filled with them.

- **Add X Account Session** — run it to give Nitter an account to fetch with, both for the first-run critical task and to add spares that spread requests across accounts. Appends to `sessions.json` (re-adding the same `auth_token` replaces that one entry) and restarts the service. Safe to repeat.
- **Remove X Account Sessions** — run it after an account is banned or a cookie is rotated. Sessions are listed by username, or by position when they have none. Deletes the selected ones from `sessions.json` and restarts. Removing the last session re-raises the critical session task.
- **Set Primary URL** — run it when RSS or canonical links point at the wrong address (for example, you now reach Nitter over Tor), or when its task asks. Offers the interface's addresses except loopback, link-local and the container bridge, pre-selecting the stored URL, else the preferred address, and stores the choice as `primaryUrl` in `store.json`. Restarts the service when it changes the link URL. Safe to repeat.
- **Manage Access** — run it to make Nitter private or public, or to replace the password. **Private** generates a 32-character password when none is stored, or when **Generate a new password** is on, and returns the username (`admin`) and password: the only time the password is shown. Otherwise it keeps the stored password and shows nothing. **Public** removes the login and keeps the stored password. Applies at once, without restarting Nitter. Replacing the password breaks every RSS reader that still has the old one.

---

## Tasks

The package raises three tasks. A critical task blocks startup and suspends the ordinary controls until it is satisfied; an important one doesn't.

- **Add X Account Session** (`critical`) — raised while `sessions.json` holds no sessions. Cleared by adding a session; returns if every session is later removed.
- **Manage Access** (`critical`) — raised while `store.json` holds no access choice, which is from install until Manage Access first runs. Cleared by running Manage Access either way; it doesn't return unless the choice is removed from `store.json`.
- **Set Primary URL** (`important`) — raised while no primary URL is stored, from install on, and whenever the stored URL's hostname is not one of the service's addresses: a domain removed, or a backup restored onto a server whose addresses differ. An IP address counts as gone while its network link is down. Cleared when Set Primary URL runs, and by itself as soon as the stored URL's hostname is among the addresses again; it returns whenever the URL goes missing again. While it is up, Nitter keeps running and links to the preferred address.

---

## Health Checks

One health check is surfaced.

| Check         | Probes                        | What a failure means                                                                 |
| ------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| Web Interface | Nitter listening on port 8080 | Still starting, or Nitter exited — most often because no valid session is configured |

The Valkey daemon carries a readiness probe too (it answers `PING`), but it has no display and is not shown; it only gates the startup order.

---

## Backups and Restore

The strategy is a wholesale volume copy (`ofVolumes('main')`): the entire `main` volume is captured, so `nitter.conf`, `sessions.json`, and `store.json` — config, sessions, the access choice with its password, and the primary URL — are all in the backup. A backup therefore carries live X session cookies and the login password.

The volume is restored before the service starts; nothing has to be rebuilt afterwards. Two caveats: cookies restored from an older backup may have been revoked by X in the meantime, in which case remove and re-add them; and on a server whose addresses differ, the restored primary URL is gone, so the Set Primary URL task is raised and Nitter links to the preferred address until a URL is chosen. The Valkey cache is never in a backup — it holds nothing that needs to survive.

---

## Limitations and Differences

1. **An X account is mandatory.** Upstream removed guest access, so without at least one valid session the service will not start (held by the critical task) and cannot fetch data.
2. **Sessions can be invalidated by X at any time.** Logging out of the browser that produced the cookies, changing the account password, or an X-side restriction breaks a session; remove and re-add it when that happens.
3. **Session creation is manual.** Upstream ships Python helper scripts; this package instead takes the two cookies directly through the Add Session action, so no script is run.
4. **`enableDebug` is held off.** The `/.sessions` debug endpoint is unavailable.
5. **No proxy support is wired up.** Upstream's `proxy` / `apiProxy` options are not exposed.
6. **Links use one URL.** Nitter builds absolute RSS and canonical links from the link URL, regardless of which address you are browsing from.
7. **Private access is a StartOS addition.** Upstream has no login. StartOS's reverse proxy asks for it on every request to the HTTPS addresses, RSS feeds included, so RSS readers need the credentials (most support Basic Auth or `user:pass@host` URLs).
8. **The plain-HTTP address skips the login.** It goes straight to Nitter. StartOS offers it to other services on the same server and on a gateway set secure with `start-cli net gateway set-secure`. Tor is one of those services: an `.onion` address added without SSL, which is Tor's default for a web interface, serves Nitter with no login even while access is private. Adding the `.onion` address with SSL on keeps the login, and Tor Browser then shows a certificate warning.
9. **Public access spends your X sessions.** Every page a visitor opens is fetched from X with the sessions you added, so heavy use by others can rate-limit or restrict those accounts.

---

## Quick Reference for AI Consumers

```yaml
package_id: nitter
images:
  - zedeus/nitter
  - valkey/valkey
architectures: [x86_64, aarch64]
subcontainers: [nitter-sub, valkey-sub]
volumes:
  main: /data
file_models:
  - nitter.conf
  - sessions.json
  - store.json
startos_managed_env_vars:
  - NITTER_CONF_FILE
  - NITTER_SESSIONS_FILE
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - add-session
  - remove-sessions
  - set-primary-url
  - manage-access
tasks:
  - { action: add-session, severity: critical }
  - { action: manage-access, severity: critical }
  - { action: set-primary-url, severity: important }
health_checks:
  - nitter # displayed as "Web Interface"
```
