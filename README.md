# MCP analytics: an 8-bit tale

A four-minute pixel-art story about product analytics for AI agents. Every frame is drawn live in the browser from code, so the site has no video file.

Live: https://lucasheriques.github.io/mcp-analytics/

## Embed it

Press "Copy embed code" in the "Embed it on your site" section of the page, or paste this. `embed-example.html` shows it on a plain page:

```html
<iframe
    src="https://lucasheriques.github.io/mcp-analytics/?embed=1"
    title="MCP analytics: an 8-bit tale"
    width="960"
    height="540"
    style="border: 0; width: 100%; aspect-ratio: 16 / 9"
    allow="fullscreen"
    allowfullscreen
    loading="lazy"
></iframe>
```

Keep `allow="fullscreen"`. Without it the fullscreen button does nothing inside the iframe. Sound starts after the viewer's first click, because browsers block autoplay with sound.

## Keyboard shortcuts

They work anywhere on the page, except while typing in a text field, and a focused button keeps Space and a focused slider keeps the arrow keys.

| Key | Action |
| --- | --- |
| Space | Play or pause |
| F | Fullscreen |
| M | Mute |
| Left, Right | Skip 5 seconds |
| Up, Down | Volume |
| 0 to 9 | Jump to 0% to 90% of the video |
| , and . | Step one frame back or forward |

## URL parameters

| Parameter | Effect |
| --- | --- |
| `embed=1` | Player only: no header, footer, or chapter cards. It fills the iframe. |
| `chapter=3` | Start at chapter 3 (0 is the title screen, 1 to 6 are the levels). |
| `t=90` | Start at 90 seconds. |
| `theme=dark` or `theme=light` | Force a theme. The default follows the viewer's system. |

## Views

The site counts views with a small Cloudflare Worker and a D1 database (`worker/`). There are no cookies, no analytics scripts, and no tracking links.

- **What is stored:** a daily count per kind (`page` or `embed`) and, for an embed, the hostname of the page that holds it. Nothing else. There is no IP address, user agent, or user ID.
- **When it counts:** a `page` or `embed` count when the page loads, and a `watched` count after ten seconds of real playback. Each kind counts at most once every 24 hours per browser, using a timestamp in that browser's localStorage, so the Worker never needs an IP address or ID to spot repeats. It does nothing on localhost or when the browser sends Do Not Track or Global Privacy Control.
- **Why not dedupe by IP:** shared IPs (offices, VPNs, mobile carriers) would count a whole team as one viewer, and it would mean storing something derived from the IP.
- **Read the numbers:**

```bash
cd worker
npx wrangler d1 execute mcp-analytics-views --remote --command "SELECT day, kind, host, count FROM views ORDER BY day DESC"
npx wrangler d1 execute mcp-analytics-views --remote --command "SELECT kind, SUM(count) AS views FROM views GROUP BY kind"
```

- **Set it up again:** `npm install`, `npx wrangler d1 create mcp-analytics-views`, put the new `database_id` in `wrangler.toml`, then `npx wrangler d1 execute mcp-analytics-views --remote --file=schema.sql` and `npx wrangler deploy`. Put the Worker URL in `src/views.ts`.
- **Public count:** `GET /count` returns the totals (`{"views": 1234, "watched": 300}`) with CORS for the site only, and the Worker caches it for five minutes. The page shows it from the first view. Raise `MIN_VIEWS_SHOWN` in `src/ViewCount.tsx` to hide it until there are more.
- **Abuse limits:** the Worker accepts counts only from `https://lucasheriques.github.io`, applies Cloudflare's per-IP rate limit (30 a minute, which is loose and approximate), and stops counting after 5,000 views a day (`DAILY_CAP`). Anyone can still send fake counts by hand, so the number is a rough count, not proof.

## Develop

```bash
npm install
npm run dev
```

`npm run build` type-checks and writes `dist/`. A push to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`. The Vite base path is `/mcp-analytics/` and changes with the `BASE_PATH` environment variable.

## How it works

`src/timeline.js` is the script: scenes, chapters, sound cues, and music. `src/engine.js` draws frame `n` onto a 320x180 canvas and scales it up, and the other `.js` files are the scene renderers. `src/player.ts` runs the frame clock and plays the sound through Web Audio. `src/Video.tsx` is the player UI.

## Comments

Comments use [giscus](https://giscus.app), which stores them in this repo's GitHub Discussions (category "Announcements"). Readers sign in with GitHub to comment. The giscus GitHub app must be installed on the repo. Embeds do not show comments.
