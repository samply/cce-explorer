# Task: Site flag emojis don't render in Chrome/Edge (Windows)

Status: open · Created 2026-11-18

## Symptom

Institute flags — regional-indicator emoji pairs (🇩🇪 🇫🇷 🇸🇪 🇳🇱 🇪🇸 🇬🇧)
in the `displayName` fields of `src/config/options.json` and
`src/config/options-test.json` — render correctly in Firefox, but appear
as letter pairs ("DE", "FR") in Chrome and Edge on Windows. This persists
despite an existing workaround: a flags subset of Noto Color Emoji
(`static/fonts/Noto_Color_Emoji/NotoColorEmoji-FlagsHeart.woff2`) wired
up in `src/app.css` via two `@font-face` rules with
`unicode-range: U+1F1E6-1F1FF` (one for the app font stack, one
hijacking "Helvetica Neue" for Chart.js canvases inside lens web
components).

Previous attempt: PR #45 (`fix/windows-flag-emojis`, commits 41580fb and
d77f930) introduced this Noto subset — it shrank the font from 25 MB to
a few kB, but Chrome/Edge still do not render the flags.

## Root cause

Windows ships no flag glyphs in any system font, and Chromium has stated
it will not add flag support on Windows
(https://github.com/talkjs/country-flag-emoji-polyfill — Background
section). Firefox works because it bundles Twemoji Mozilla. The exact
Chromium fallback mechanics are murky, but empirically the plain
`@font-face` + Noto subset route does not take effect in Chrome/Edge,
while the polyfill's approach (COLRv1 Twemoji flags font, loaded only
when a canvas test shows flags are unsupported) does — that library
exists for precisely this problem.

## Chosen approach (user decision, 2026-11-18)

Use the polyfill approach (`country-flag-emoji-polyfill`, TalkJS) — do
not switch to SVG/PNG flag images (rejected: `displayName` stays plain
text, no per-site asset management, works in lens web components).

Implementation constraints:

- `npm install country-flag-emoji-polyfill` (0.7 kB gzipped, zero deps).
- Call `polyfillCountryFlagEmojis()` once at app startup (e.g.
  `src/App.svelte` or `src/routes/+layout.svelte`).
- Prefix `"Twemoji Country Flags"` onto `--font-family` in
  `src/app.css` — this single variable feeds body, buttons, and the
  `lens-result-table` shadow-DOM override.
- Charts: the lens components render Chart.js canvases with their own
  font ("Helvetica Neue", …) inside shadow DOM. Check whether the
  existing "Helvetica Neue" `@font-face` hack still works in Chrome/Edge
  after the polyfill lands; only remove that hack if verified
  unnecessary. If chart flags are still broken, grep
  `node_modules/@samply/lens` for hardcoded `font-family` strings and
  extend the document-level overrides in `app.css` the same way the
  `lens-result-table` override was done.
- Self-host the font: download `TwemojiCountryFlags.woff2` (78 kB) into
  `static/fonts/` and pass `fontUrl` to `polyfillCountryFlagEmojis()`
  rather than keeping the default jsdelivr CDN request (no third-party
  runtime request, consistent with the existing self-hosted fonts).
- Keep the existing Noto subset `@font-face` for the footer ♥ (U+2665) —
  the polyfill font contains only flags.

Fallback if the library misbehaves: replicate its mechanism by hand —
load a flags-only COLRv1 woff2 via the CSS Font Loading API and inject
the `@font-face` with `unicode-range` only when a canvas probe shows
flags are unsupported.

## Out of scope

- Replacing emoji flags with images (see above).
- Flag rendering anywhere other than institute `displayName`s.

## Verification

1. Windows + Chrome and Windows + Edge: all six institute flags render
   as flags — check the site-selection UI, the result table, and chart
   labels.
2. Windows + Firefox: no regression; the polyfill is a no-op and must
   not download the font (confirm in the Network tab).
3. Spot-check macOS or Linux: no regression.
4. `npm run lint && npm run format && npm run check` and
   `bash scripts/validate-json-schema.bash` pass (see AGENTS.md).

## Disposition

After the fix is merged: delete (or archive) this file, and promote the
"Chosen approach" section to
`docs/adr/0002-country-flag-emoji-via-polyfill.md`.
