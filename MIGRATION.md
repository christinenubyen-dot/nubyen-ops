# Nubyén Ops — Migrating to Cloudflare Pages + Access (login security)

This moves the dashboard from public GitHub Pages to **Cloudflare Pages**, then
puts **Cloudflare Access** in front so only your team (2–10 people) can open it.
Both the dashboard and `data.json` become protected — no one outside your
allow-list can load anything. Free at your scale. No custom domain needed
(works on `*.pages.dev`).

The app code is already prepped for this:
- `vite.config.js` base changed to `/` (Cloudflare serves at root)
- The sync workflow now only fetches + commits data; Cloudflare auto-deploys

---

## Part 1 — Host on Cloudflare Pages

1. Create a free account at https://dash.cloudflare.com
2. **Workers & Pages → Create → Pages → Connect to Git.**
3. Authorize GitHub and select your **nubyen-ops** repo.
4. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Save and Deploy.** In ~1–2 min you'll get a URL like
   `https://nubyen-ops.pages.dev`.

From now on, every push to the repo (including the hourly sync bot's commits)
triggers a Cloudflare rebuild automatically. You no longer need the GitHub
Pages deployment.

> After confirming Cloudflare works, you can turn off GitHub Pages
> (repo → Settings → Pages → set Source to "None") to avoid two live copies.

## Part 2 — Confirm the hourly sync still works

Nothing to change — your three GitHub Secrets (`SHOPIFY_STORE`,
`SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`) stay where they are. The
**Sync Shopify data** action fetches from Shopify and commits `data.json` +
`history.json`; Cloudflare sees the commit and redeploys. Run it once manually
(Actions → Sync Shopify data → Run workflow) to confirm.

## Part 3 — Turn on Access (the actual login)

1. In Cloudflare dashboard, open **Zero Trust** (left sidebar). If it's your
   first time, pick a team name and the **Free** plan (covers up to 50 users).
2. **Access → Applications → Add an application → Self-hosted.**
3. **Application configuration:**
   - **Application name:** Nubyén Ops
   - **Session duration:** your call (e.g. 24 hours)
   - **Application domain:** enter your Pages URL. For a pages.dev site, set
     the subdomain to `nubyen-ops` and domain `pages.dev`.
4. **Next → Add policy:**
   - **Policy name:** Team
   - **Action:** Allow
   - **Configure rules → Include → Emails:** add each teammate's email
     address. (Or use **Emails ending in** `@yourcompany.com` if you share a
     domain.)
5. **Next → Login methods:** leave **One-time PIN** enabled (emails a 6-digit
   code). No extra identity provider needed.
6. **Add application / Save.**

Done. Now visiting `nubyen-ops.pages.dev` shows a Cloudflare login: the visitor
enters an approved email, gets a code, and only then loads the dashboard.
Anyone not on the list — or trying to open `/data.json` directly — is blocked.

---

## Managing the team later

- **Add/remove people:** Zero Trust → Access → Applications → Nubyén Ops →
  edit the policy's email list.
- **Kick everyone out immediately:** delete the application or change the
  policy; sessions can be revoked under Access → Sessions.

## Notes & honest caveats

- **URL changes** to `nubyen-ops.pages.dev`. Update team bookmarks.
- **First Access setup** is the fiddliest ~15 minutes of this project. After
  that it's set-and-forget.
- **Two live copies during transition:** until you disable GitHub Pages, the
  old public URL still works and is still unprotected. Turn it off (Part 1
  note) once Cloudflare is confirmed, or the whole point is lost.
- **pages.dev vs custom domain:** Access works on pages.dev. A custom domain
  is only nicer for branding/SSO; not required.
- If you ever move back to GitHub Pages, revert `base` in `vite.config.js` to
  `"/nubyen-ops/"` and restore the build/deploy step in the workflow.
