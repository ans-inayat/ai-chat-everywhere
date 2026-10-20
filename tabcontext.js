// Tab context: read the page text of one or more open tabs (like Edge Copilot).
// Requires "scripting" + "tabs", requested at runtime — the user must accept
// Chrome's permission prompt before anything is read.
(function () {
  "use strict";

  const BASE_PERMS = { permissions: ["scripting", "tabs"] };
  const HTTP_PERMS = { permissions: ["scripting", "tabs"], origins: ["http://*/*"] };

  const MAX_PER_TAB = 20000;
  const MAX_TOTAL = 100000;
  const CTX_KEY = "tabContext";

  const els = {};
  [
    "btnTabs", "contextBar", "contextInfo", "btnCopyCtx", "btnViewCtx", "btnClearCtx",
    "tabsOverlay", "btnCloseTabs", "tabsFilter", "tabsList", "tabsCount",
    "btnSelectAll", "btnClearSel", "btnReadTabs",
    "confirmOverlay", "confirmList", "confirmCancel", "confirmOk",
    "previewOverlay", "btnClosePreview", "previewText", "previewCount", "btnCopyEdited"
  ].forEach((id) => (els[id] = document.getElementById(id)));

  let allTabs = [];
  let selected = new Set();
  let pendingRead = [];
  let context = null;

  /* ---------- injected into the page being read ---------- */
  function extractPageText(limit) {
    const root = document.body || document.documentElement;
    let text = "";
    if (root && typeof root.innerText === "string") text = root.innerText;
    text = text.replace(/\n{3,}/g, "\n\n").trim();
    if (text.length > limit) text = text.slice(0, limit) + "\n…[truncated]";
    return { title: document.title || "", url: location.href, text: text };
  }

  /* ---------- stored context (session only) ---------- */

  async function loadContext() {
    const store = await chrome.storage.session.get(CTX_KEY);
    context = store[CTX_KEY] || null;
    renderBar();
  }

  async function saveContext(ctx) {
    context = ctx;
    await chrome.storage.session.set({ [CTX_KEY]: ctx });
    renderBar();
  }

  async function clearContext() {
    context = null;
    await chrome.storage.session.remove(CTX_KEY);
    renderBar();
  }

  function renderBar() {
    if (!context || !context.tabs || !context.tabs.length) {
      els.contextBar.hidden = true;
      return;
    }
    const chars = context.tabs.reduce((sum, t) => sum + (t.text ? t.text.length : 0), 0);
    els.contextInfo.textContent =
      `📑 ${context.tabs.length} tab${context.tabs.length === 1 ? "" : "s"} · ${formatSize(chars)}`;
    els.contextBar.hidden = false;
  }

  function formatSize(chars) {
    return chars < 1000 ? `${chars} B` : `${(chars / 1000).toFixed(1)} KB`;
  }

  function composeContext() {
    if (!context || !context.tabs) return "";
    const header =
      `Context from ${context.tabs.length} open tab(s), read with your permission:\n`;
    const body = context.tabs
      .map((t, i) => `\n[${i + 1}] ${t.title || "(untitled)"}\nURL: ${t.url}\n${t.text || "(no readable text)"}`)
      .join("\n");
    return (header + body).slice(0, MAX_TOTAL);
  }

  /* ---------- permission gate ---------- */

  function requestPerms(perms) {
    // Must be kicked off directly from the click handler (user gesture).
    return chrome.permissions.request(perms).catch((err) => {
      console.error("permissions.request failed:", err);
      return false;
    });
  }

  function ensureBasePermissions() {
    return chrome.permissions
      .contains(BASE_PERMS)
      .then((has) => (has ? true : requestPerms(BASE_PERMS)))
      .catch(() => false);
  }

  /* ---------- tab picker ---------- */

  async function openPicker() {
    els.tabsOverlay.hidden = false;
    els.tabsFilter.value = "";
    await refreshTabs();
    els.tabsFilter.focus();
  }

  function closePicker() {
    els.tabsOverlay.hidden = true;
  }

  async function refreshTabs() {
    try {
      allTabs = await chrome.tabs.query({});
    } catch (err) {
      console.error(err);
      allTabs = [];
    }
    const known = new Set(allTabs.map((t) => t.id));
    for (const id of [...selected]) if (!known.has(id)) selected.delete(id);
    renderList();
  }

  function readableScheme(url) {
    return /^https?:\/\//i.test(url || "");
  }

  function visibleTabs() {
    const q = els.tabsFilter.value.trim().toLowerCase();
    if (!q) return allTabs;
    return allTabs.filter(
      (t) =>
        (t.title || "").toLowerCase().includes(q) ||
        (t.url || "").toLowerCase().includes(q)
    );
  }

  function renderList() {
    const tabs = visibleTabs();
    els.tabsList.textContent = "";

    if (!tabs.length) {
      const empty = document.createElement("div");
      empty.className = "emptyList";
      empty.textContent = "No open tabs match.";
      els.tabsList.appendChild(empty);
      updateCount();
      return;
    }

    const windowOrder = [...new Set(allTabs.map((t) => t.windowId))];
    const windowCount = windowOrder.length;
    let lastWindow = null;

    tabs.forEach((tab) => {
      if (windowCount > 1 && tab.windowId !== lastWindow) {
        lastWindow = tab.windowId;
        const head = document.createElement("div");
        head.className = "windowHead";
        head.textContent = `Window ${windowOrder.indexOf(tab.windowId) + 1}`;
        els.tabsList.appendChild(head);
      }

      const row = document.createElement("label");
      row.className = "tabRow";

      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = selected.has(tab.id);
      box.addEventListener("change", () => {
        if (box.checked) selected.add(tab.id);
        else selected.delete(tab.id);
        updateCount();
      });

      const fav = document.createElement("img");
      fav.className = "fav";
      fav.alt = "";
      fav.src = tab.favIconUrl || "icon-32.png";
      fav.addEventListener("error", () => (fav.src = "icon-32.png"));

      const meta = document.createElement("div");
      meta.className = "meta";
      const title = document.createElement("div");
      title.className = "t";
      title.textContent = tab.title || "(no title — Chrome will show it after you allow the permission)";
      const url = document.createElement("div");
      url.className = "u";
      url.textContent = tab.url || "chrome://…";
      meta.append(title, url);

      row.append(box, fav, meta);

      if (!readableScheme(tab.url) && tab.url) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.title = "Restricted page (chrome://, file://, …) cannot be read";
        badge.textContent = "no access";
        row.appendChild(badge);
      }

      els.tabsList.appendChild(row);
    });

    updateCount();
  }

  function updateCount() {
    els.tabsCount.textContent = `${selected.size} selected`;
  }

  /* ---------- confirm + read ---------- */

  function askConfirm() {
    pendingRead = allTabs.filter(
      (t) => selected.has(t.id) && readableScheme(t.url)
    );
    const skipped = selected.size - pendingRead.length;

    if (!pendingRead.length) {
      showToast(
        skipped
          ? "Those tabs are restricted pages — pick normal website tabs."
          : "Select at least one tab first."
      );
      return;
    }

    els.confirmList.textContent = "";
    pendingRead.forEach((tab) => {
      const item = document.createElement("div");
      item.className = "item";
      const t = document.createElement("div");
      t.textContent = tab.title || tab.url;
      const u = document.createElement("div");
      u.textContent = tab.url;
      item.append(t, u);
      els.confirmList.appendChild(item);
    });

    els.confirmOverlay.hidden = false;
  }

  async function readSelected() {
    const results = [];
    const failed = [];

    for (const tab of pendingRead) {
      try {
        const [injection] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractPageText,
          args: [MAX_PER_TAB]
        });
        const value = injection && injection.result;
        if (value) {
          results.push({
            title: value.title || tab.title || tab.url,
            url: value.url || tab.url,
            text: value.text || ""
          });
        } else {
          failed.push(tab);
        }
      } catch (err) {
        console.warn("Could not read tab:", tab.url, err);
        failed.push(tab);
      }
    }

    if (results.length) {
      await saveContext({
        tabs: results,
        readAt: Date.now(),
        total: results.reduce((n, t) => n + t.text.length, 0)
      });
      const msg =
        `${results.length} tab${results.length === 1 ? "" : "s"} read` +
        (failed.length ? ` (${failed.length} could not be read)` : "") +
        " — press Copy, then paste into the chat.";
      showToast(msg);
    } else {
      showToast("Could not read those tabs. Check the extension permission in chrome://extensions.");
    }
  }

  /* ---------- clipboard ---------- */

  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      /* fall through to execCommand */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (err) {
      return false;
    }
  }

  async function copyToChat(text, message) {
    const ok = await copyText(text);
    showToast(
      ok ? message : "Copy failed — use View, select all and copy manually."
    );
  }

  /* ---------- wiring ---------- */

  els.btnTabs.addEventListener("click", () => {
    ensureBasePermissions().then((granted) => {
      if (granted) openPicker();
      else showToast("Permission to read tabs was not granted.");
    });
  });

  els.btnCloseTabs.addEventListener("click", closePicker);
  els.tabsFilter.addEventListener("input", renderList);

  els.btnSelectAll.addEventListener("click", () => {
    visibleTabs().forEach((t) => selected.add(t.id));
    renderList();
  });

  els.btnClearSel.addEventListener("click", () => {
    selected.clear();
    renderList();
  });

  els.btnReadTabs.addEventListener("click", askConfirm);

  els.confirmCancel.addEventListener("click", () => {
    els.confirmOverlay.hidden = true;
  });

  els.confirmOk.addEventListener("click", () => {
    const needsHttp = pendingRead.some((t) => /^http:\/\//i.test(t.url || ""));
    const request = needsHttp
      ? requestPerms(HTTP_PERMS) // keep this call in the click handler (gesture)
      : Promise.resolve(true);

    request.then((granted) => {
      els.confirmOverlay.hidden = true;
      if (!granted) {
        showToast("Reading http:// tabs needs the extra permission — cancelled.");
        return;
      }
      const runnable = needsHttp
        ? pendingRead.filter((t) => readableScheme(t.url))
        : pendingRead;
      pendingRead = runnable;
      readSelected().then(() => closePicker());
    });
  });

  els.btnCopyCtx.addEventListener("click", () => {
    copyToChat(
      composeContext(),
      "Context copied — click the chat box and press Ctrl+V, then ask your question."
    );
  });

  els.btnViewCtx.addEventListener("click", () => {
    els.previewText.value = composeContext();
    els.previewCount.textContent = `${els.previewText.value.length} characters`;
    els.previewOverlay.hidden = false;
  });

  els.previewText.addEventListener("input", () => {
    els.previewCount.textContent = `${els.previewText.value.length} characters`;
  });

  els.btnClosePreview.addEventListener("click", () => {
    els.previewOverlay.hidden = true;
  });

  els.btnCopyEdited.addEventListener("click", () => {
    copyToChat(els.previewText.value, "Copied — paste into the chat with Ctrl+V.");
  });

  els.btnClearCtx.addEventListener("click", () => {
    clearContext().then(() => showToast("Tab context cleared."));
  });

  // Keep the bar in sync if another side panel instance changes it
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "session" && changes[CTX_KEY]) {
      context = changes[CTX_KEY].newValue || null;
      renderBar();
    }
  });

  loadContext();
})();
