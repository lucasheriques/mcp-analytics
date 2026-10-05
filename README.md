# MCP analytics: an 8-bit tale

A four-minute pixel-art story about product analytics for AI agents. Every frame is drawn live in the browser from code, so the site has no video file.

Live: https://lucasheriques.github.io/mcp-analytics/

## Embed it

Press "Copy embed code" on the page, or paste this:

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

## URL parameters

| Parameter | Effect |
| --- | --- |
| `embed=1` | Player only: no header, footer, or chapter cards. It fills the iframe. |
| `chapter=3` | Start at chapter 3 (0 is the title screen, 1 to 6 are the levels). |
| `t=90` | Start at 90 seconds. |
| `theme=dark` or `theme=light` | Force a theme. The default follows the viewer's system. |

## Events

The player captures `Played video`, `Video chapter reached` (with `chapter_index` and `chapter_name`), and `Completed video` into PostHog. Every event carries `embedded` and `embed_referrer`, so embeds are easy to tell apart.

The build sends nothing unless a project key is set. In the repo settings, add the Actions variables `VITE_POSTHOG_KEY` and, for EU or self-hosted projects, `VITE_POSTHOG_HOST`.

## Develop

```bash
npm install
npm run dev
```

`npm run build` type-checks and writes `dist/`. A push to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`. The Vite base path is `/mcp-analytics/` and changes with the `BASE_PATH` environment variable.

## How it works

`src/timeline.js` is the script: scenes, chapters, sound cues, and music. `src/engine.js` draws frame `n` onto a 320x180 canvas and scales it up, and the other `.js` files are the scene renderers. `src/player.ts` runs the frame clock and plays the sound through Web Audio. `src/Video.tsx` is the player UI.

## Credits

Music is from Epidemic Sound, and the sound effects are from an 8-bit SFX library. Check the license for both before you reuse them.
