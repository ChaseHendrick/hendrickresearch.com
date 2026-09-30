# Privacy

Fibers of Earth has no accounts, analytics, advertising, remote fonts or application backend. Application content, the research directory, weave and pattern guide and the base 1:110m map are bundled. No user content is sent to an AI service. Automated browser tests use temporary browser profiles.

## What stays on your device

| Local-storage key | Purpose | How to remove it |
| --- | --- | --- |
| `fibersOfEarth.saved.v2` | Saved material IDs | Unsave individual materials or select **Clear my saved materials** on the Privacy page. |
| `fibersOfEarth.brands.v1` | Saved brand-directory IDs | Unsave entries in the directory, using **My saved brands on this device** to see the shortlist. |
| `fibersOfEarth.display.v1` | Motion, text size, contrast and link-underlining settings | Select **Restore defaults** in Display settings. |

You can also remove these values through your browser's site-data controls. Clearing saved materials does not clear saved brands or display settings. If storage is unavailable, changes work for the current session and may not survive a reload. Saved collections are not synced between browsers or devices.

Search, filtering and comparison run locally. Shareable choices appear in URL fragments. Weave comparisons store up to three entry IDs in that fragment and introduce no local-storage key; sharing a comparison includes those chosen IDs. A saved-only directory link refers to the recipient's local shortlist; it does not transmit your saved-brand IDs. Shortlist JSON exports do contain the selected brand records, so the exported file can be shared deliberately.

When the hosted globe is zoomed in, detailed Natural Earth coastline files (1:50m and 1:10m) are requested from the same site. The single-file offline copy keeps the bundled map. Reading directory facts does not automatically contact the listed companies or Wikidata. Weave-guide SVGs are generated from bundled data, so reading the guide and its reference list does not request museum images or contact reference publishers unless you follow a link.

## When data leaves your device

A hosting provider receives normal page and asset requests when the site is opened online and may maintain its own logs. External links visit independent reference sites under their policies. Download controls create files locally. Clipboard writing occurs when you choose a sharing or citation-copy control. A file-based view shares only the route fragment, never its local filesystem path.

The on-demand repository babysit command checks local data, the build and browser behavior. It is not a scheduled monitor and does not crawl external brand or reference websites. CI runs on repository changes or manual dispatch and uploads browser-check evidence to the repository's Actions run.
