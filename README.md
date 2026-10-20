# Ai Chat everywhere — Chrome side panel

Open ChatGPT, Gemini, Claude, Grok, DeepSeek, Perplexity and 60+ other AI tools **inside Chrome's native side panel**, without leaving the page you are on. The panel keeps the **same chat session** — switch back to the menu, switch AI, or browse other tabs, and your chat is still there when you return.

> Chrome has no Firefox-style `sidebar_action`, so this is built on the [Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) (Chrome 114+). The chat is hosted in the panel as a framed page; a small `declarativeNetRequest` rule removes `X-Frame-Options` / `Content-Security-Policy` **on iframe responses only**, so the official AI UI loads inside the sidebar with your existing login.

## Features

- Native Chrome side panel (pushes the page aside, not an overlay)
- Toolbar icon opens the panel directly
- Full AI menu inside the panel: main list, Categories (search, agents, image, files, music, code, face swap) and Prompts
- **Same chat session in the sidebar**: the iframe is only reloaded when you pick a different site; menu/chat switching and panel reopen restore your last chat
- **Read open tabs into the chat** (like Edge Copilot): attach one or several tabs as context, then paste it into any AI
- "open chat in new tab" option if a site refuses to be framed
- Daily cleanup of AI URLs from your local browsing history
- Uses your existing AI logins — no accounts, no third-party auth, no data collection

## 📑 Read tabs into the chat

Click the **📑** button in the panel header:

1. **Permission** — the first click asks Chrome to allow the *optional* `scripting` + `tabs` permissions. Nothing is read until you press **Allow**; you can decline and the feature simply stays off.
2. **Pick tabs** — a list of your open tabs (title, URL, favicon, per window) with checkboxes, a filter field, and **All** / **None** shortcuts. Restricted pages (`chrome://`, `file://`, …) are marked *no access*.
3. **Confirm** — a second dialog shows exactly which tabs will be read before anything happens.
4. **Use it** — the page text of each selected tab (up to 20 000 characters per tab) is stored **locally for the browser session only**, shown as `📑 N tabs · X KB` in the header, then:
   - **Copy** → puts the formatted context on the clipboard; click the chat box and press `Ctrl+V`, then ask your question
   - **View** → preview/edit the text before copying
   - **✕** → clear it from memory at any time

The text never leaves your machine and is never uploaded anywhere.

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
| `tabcontext.js` | 📑 Tab reader: picker, consent dialog, text extraction, clipboard |
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
| **optional** `scripting` | Read the text of the tabs you explicitly select — requested at runtime the first time you use 📑, never before |
| **optional** `tabs` | List your open tabs (title/URL/favicon) in the picker — same runtime prompt |
| **optional** `http://*/*` | Only requested if you tick an `http://` tab, so it can be read too |

No data is collected, stored remotely, or transmitted anywhere. See [PRIVACY.md](PRIVACY.md).

## 💝 Support the project

The extension is free, ad-free and open source. If it saves you time, you can support development (all optional):

- ⭐ **GitHub Sponsors** — <https://github.com/sponsors/ans-inayat>
- ☕ **Buy Me a Coffee** — enabled on the donate page once the account exists
- ☕ **Ko-fi** — enabled on the donate page once the account exists

Inside the extension: **menu → ❤️ Support / Donate** (or the 🍕 Donate link at the bottom of the menu). Donations go directly to the developer — the extension never charges anything and never handles payments itself.

To enable Ko-fi / Buy Me a Coffee, put your username in the two commented-out links in `donate.html` (and in `.github/FUNDING.yml` for the repo's Sponsor button).

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
