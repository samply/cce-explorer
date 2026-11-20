<script>
  // Using hot module replacement (HMR) with custom elements (aka web
  // components) does not work because a custom element cannot be updated once
  // registered, see https://github.com/WICG/webcomponents/issues/820.
  // Therefore we do a full page reload instead of HMR.
  if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
      window.location.reload();
    });
  }

  // Import Lens CSS and JS bundles
  import "@samply/lens/style.css";
  import "@samply/lens";

  // Chromium on Windows cannot render country-flag emojis and ignores the
  // @font-face fallback in app.css; this injects a self-hosted flags-only
  // font (no-op on browsers with native flag support; ssr=false, so this
  // always runs client-side). See docs/tasks/2026-11-18-fix-site-flags-chrome-edge.md
  import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
  polyfillCountryFlagEmojis(
    "Twemoji Country Flags",
    "/fonts/TwemojiCountryFlags.woff2",
  );

  import App from "../App.svelte";
</script>

<App />
