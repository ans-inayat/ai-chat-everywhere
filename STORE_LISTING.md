# Chrome Web Store submission kit — Ai Chat everywhere

Fill the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) with the values below.

---

## 1. Store listing

**Title (max 45 chars):**

```
Ai Chat everywhere - AI sidebar
```

**Summary (max 132 chars):**

```
Open ChatGPT, Gemini, Claude & 60+ AI chats in Chrome's side panel and keep the same chat session while you browse.
```

**Description (long):**

```
Open ChatGPT, Gemini, Claude, Grok, DeepSeek, Perplexity and 60+ other AI tools directly inside Chrome's native side panel — without losing the page you are working on.

• Native Chrome side panel: the AI chat sits beside the website, not on top of it
• Same chat session stays in the sidebar: switch to the menu, switch AI, or browse other tabs — your chat is still there when you return (it uses your existing AI login)
• Read your open tabs into the chat, like Copilot: press 📑, allow the optional permission Chrome asks for, tick one or several tabs, confirm — the page text is attached locally and ready to paste into any AI with Ctrl+V
• Full menu inside the panel: main AI list, Categories (search, agents, image generators incl. Nano Banana, video generators incl. Google Flow/Veo, Sora and Seedance, vibe-code app builders like Lovable/Bolt/v0, public prompt libraries, files & spreadsheets, music, code, face swap) and curated Prompt collections
• "Open chat in new tab" option for any site that refuses to be framed
• Daily cleanup of AI URLs from your local browsing history for privacy
• No accounts, no sign-up, no data collection: everything stays in your browser

Supported sites include OpenAI ChatGPT, Google Gemini (Nano Banana image generation), Claude, Grok, NotebookLM, Bing Image Creator, Microsoft Copilot, DeepSeek, Perplexity, Poe, DuckDuckGo AI, You.com, Mistral, Phind, Blackbox, Suno, Udio, ElevenLabs, Midjourney, Leonardo, Freepik, Recraft, Krea, Stable Diffusion, Pollinations, ChatPDF, ChatDoc, MindGrasp, Websim, Cursor, Codex, plus video generators (Google Flow with Veo, OpenAI Sora, ByteDance Seedance via Dreamina, Kling, Runway, Luma, Pika, Hailuo, Vidu, PixVerse), vibe-code app builders (Lovable, Bolt, v0, Replit, Base44, Manus, Genspark, Trae, Firebase Studio, Devin) and public prompt libraries (FlowGPT, PromptBase, PromptHero, Lexica, CivitAI, OpenArt).

How it works: Chrome does not allow arbitrary websites as side panels, so the chat is rendered inside the panel with a framing rule that removes X-Frame-Options / Content-Security-Policy from iframe responses only. When you visit those AI sites in a normal tab, all their security headers remain fully intact.

Free to use, ad-free and open source. Optional donations are available from the menu (❤️ Support / Donate) and go directly to the developer via bank transfer (Meezan Bank, Pakistan — the developer's country; Ko-fi / Buy Me a Coffee / GitHub Sponsors payouts are not available there). Nothing is charged inside the extension.
```

**Category:** Productivity
**Language:** English (add more if you translate)

---

## 2. Single purpose

```
Display AI chat websites in Chrome's side panel so users can talk to them while browsing other pages.
```

---

## 3. Privacy practices — tabs

### Privacy policy
Host `PRIVACY.md` publicly (it is in the repo). Use the GitHub page URL once pushed:

```
https://github.com/ans-inayat/ai-chat-everywhere/blob/main/PRIVACY.md
```

### Data collection disclosures (all = No)
- Does this product collect or transmit user data? **No**
- Does it collect web content? **No**
- Does it collect browsing activity? **No** (the `history` permission is used only to *delete* specific URLs locally)

> Note for reviewers: the optional "Read tabs" feature reads page text **only** after the user presses 📑, accepts Chrome's permission prompt, ticks specific tabs and confirms again. The text is kept in `chrome.storage.session` (deleted when the browser closes) and is only ever copied to the user's own clipboard — it is never transmitted by the extension.

> Donations: the "❤️ Support / Donate" menu entry is a plain informational page showing the developer's bank transfer details (account title, IBAN, SWIFT) with copy-to-clipboard buttons. It contains no payment form, no Web Store payments and no digital-goods purchase flow — donations are handled entirely off-store by ordinary bank transfer. Bank details are shown because the developer is based in Pakistan, where Ko-fi / Buy Me a Coffee / GitHub Sponsors payouts are not supported.

### Permission justifications (fill the form fields with these)

| Field | Justification |
|-------|---------------|
| `sidePanel` | Required to display the selected AI chat website in Chrome's side panel, which is the core function of the extension. |
| `storage` | Remembers the user's last opened chat, the current menu view, and the "open chat in new tab" preference locally on the device. |
| `history` | Deletes AI-website URLs from the user's local browsing history so that opening chats does not clutter or expose their history. The extension never reads or uploads history. |
| `declarativeNetRequestWithHostAccess` | Removes `X-Frame-Options` and `Content-Security-Policy` response headers from iframe (sub_frame) requests only, so the official AI website UIs can render inside the side panel. Top-level navigation is not affected. |
| `host_permissions: https://*/*` | Needed so the framing-header rule above can apply to any AI website the user chooses to open in the panel. No page content is read or modified. |
| `scripting` (**optional**, runtime) | Asked for only when the user presses the 📑 "Read tabs" button and accepts Chrome's prompt. Reads the visible page text of the tabs the user ticks in the picker, stored locally for the session so it can be pasted into an AI chat. Nothing is read without that explicit action and consent. |
| `tabs` (**optional**, runtime) | Same prompt: lists the user's open tabs (title, URL, favicon) in the picker so the user can choose which tabs to attach. |
| `http://*/*` (**optional**, runtime) | Requested only if the user ticks an `http://` tab in the picker, so that tab's text can be read. |

---

## 4. Graphics assets (you must create these)

| Asset | Size |
|-------|------|
| Small promo tile | 440×280 |
| Large promo tile (marquee) | 1400×560 (optional) |
| Screenshots (at least 1) | 1280×800 or 640×400, PNG/JPEG |

Suggested screenshot set: (1) side panel open with ChatGPT next to a normal website, (2) the AI menu inside the panel, (3) switching between two AI chats.

---

## 5. Build the upload zip

```bash
cd /path/to/repo
bash build-store-zip.sh
# produces dist/ai-chat-everywhere-v<manifest version>.zip  → upload this file
```

---

## 6. Submission checklist

1. Pay the one-time $5 developer registration fee (if you have not already)
2. New item → upload the zip produced by `build-store-zip.sh` (see section 5)
3. Fill store listing with section 1 above
4. Fill privacy practices with section 3 above
5. Upload graphics (section 4)
6. Set visibility (public) and distribution regions
7. Submit for review (usually 1–3 business days for a first publish)

**Review tip:** reviewers may test the "open chat in new tab" checkbox and expect the panel to show the menu on first run. Both work out of the box — no special steps needed.
