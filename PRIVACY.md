# Privacy Policy — Ai Chat everywhere

_Last updated: 13 October 2026_

## Summary

**This extension does not collect, store, sell, or transmit any personal data.** There is no analytics, no tracking, no remote server, and no remote code. Everything it does happens locally in your browser.

## Permissions and what they are used for

| Permission | Use | Data leaving your device |
|------------|-----|--------------------------|
| `sidePanel` | Display the AI chat inside Chrome's side panel | None |
| `storage` | Save your last opened chat, current menu view and the "open chat in new tab" option, locally in `chrome.storage.local` | None |
| `history` | Delete AI website URLs from your local browsing history once a day, so visiting AI sites from the panel does not clutter your history | None |
| `declarativeNetRequestWithHostAccess` | Remove `X-Frame-Options` and `Content-Security-Policy` response headers from **iframe (sub_frame) requests only**, so AI websites can render inside the panel. Normal top-level browsing of those sites is not modified. | None |
| `https://*/*` (host permissions) | Required so the header rule above can apply to the AI sites you open in the panel | None |

## Third-party websites

When you open an AI website in the panel, that site is loaded in an iframe and your interaction with it is governed by **that site's own privacy policy and terms**. This extension does not read, intercept, or store your conversations. Your login cookies stay on your device and belong to the respective AI service.

## Data storage and deletion

All extension settings live in `chrome.storage.local` on your device. To erase them: `chrome://extensions` → **Ai Chat everywhere** → **Details** → **Extension options** / clear via removing the extension. Removing the extension deletes all its local data.

## Changes

Any change to this policy will be published in this repository with an updated date.

## Contact

Open an issue in this repository for privacy questions.
