# Ai Chat everywhere — Chrome side panel

Open ChatGPT, Gemini, Claude, Grok, DeepSeek, Perplexity and 60+ other AI tools **inside Chrome's native side panel**, without leaving the page you are on. The panel keeps the **same chat session** — switch back to the menu, switch AI, or browse other tabs, and your chat is still there when you return.

> Chrome has no Firefox-style `sidebar_action`, so this is built on the [Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) (Chrome 114+). The chat is hosted in the panel as a framed page; a small `declarativeNetRequest` rule removes `X-Frame-Options` / `Content-Security-Policy` **on iframe responses only**, so the official AI UI loads inside the sidebar with your existing login.

## Features

- Native Chrome side panel (pushes the page aside, not an overlay)
- Toolbar icon opens the panel directly
- Full AI menu inside the panel: main list, Categories (search, agents, image, files, music, code, face swap) and Prompts
- **Same chat session in the sidebar**: the iframe is only reloaded when you pick a different site; menu/chat switching and panel reopen restore your last chat
- "open chat in new tab" option if a site refuses to be framed
- Daily cleanup of AI URLs from your local browsing history
- Uses your existing AI logins — no accounts, no third-party auth, no data collection

## Install (unpacked)

1. Download or clone this repo
2. Open `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this folder

Requires Chrome 114 or newer.

## Supported AI sites

ChatGPT, Gemini, Claude, Grok, NotebookLM, Bing Image, DeepSeek, Copilot, Perplexity, Poe, DuckDuckGo AI, You.com, Mistral, Phind, Blackbox, Suno, Udio, ElevenLabs, Midjourney, Leonardo, Freepik, Recraft, Krea, Stable Diffusion, Pollinations, ChatPDF, ChatDoc, MindGrasp, Websim, Cursor, Codex and more — see `popup.html` and `pages/*.html`.

## How it works

| File | Role |
|------|------|
| `sidepanel.html/js/css` | Side panel UI: menu (loaded from the pages below) + chat iframe, session restore via `chrome.storage` |
| `popup.html`, `category.html`, `prompts.html`, `pages/` | The menu itself (fetched and rendered inside the panel) |
| `rules.json` | DNR rule: strips `X-Frame-Options` and `Content-Security-Policy` from **sub_frame** responses only |
| `background.js` | Opens the panel on toolbar click; daily history cleanup |

Visiting the AI sites directly in a normal tab is **not** affected — all their security headers stay intact there.

## Permissions

| Permission | Why |
|------------|-----|
| `sidePanel` | Show the AI chat in Chrome's side panel |
| `storage` | Remember the last open chat, menu view and "open in new tab" setting |
| `history` | Remove AI site URLs from your local browsing history (privacy) |
| `declarativeNetRequestWithHostAccess` + `https://*/*` | Remove framing headers (`X-Frame-Options`, `Content-Security-Policy`) from iframe responses so AI sites can render in the panel |

No data is collected, stored remotely, or transmitted anywhere. See [PRIVACY.md](PRIVACY.md).

## Firefox

The original Firefox add-on lives at [khzg/ChatGPT](https://github.com/khzg/ChatGPT) ([AMO listing](https://addons.mozilla.org/en-US/firefox/addon/chatgpt-everywhere/)). This repo is the Chrome (MV3 + Side Panel) conversion of that extension. The old Firefox package is kept in `Ai-Chat-everywhere.zip`.

## Adding more AI sites

Add an entry to `popup.html` (or any file in `pages/`):

```html
<li data-website="https://example.com">Example AI</li>
```

Two conditions: the site must be useful and user-friendly, and it must offer a free plan or limited free usage.

## Credits

- Original extension: [khzg/ChatGPT](https://github.com/khzg/ChatGPT) (Ai Chat everywhere, Firefox)
- Chrome conversion: side panel, MV3, session persistence, DNR framing rules
