const menuView = document.getElementById("menuView");
const menuContent = document.getElementById("menuContent");
const chatView = document.getElementById("chatView");
const chatFrame = document.getElementById("chatFrame");
const chatTitle = document.getElementById("chatTitle");
const chatActions = document.getElementById("chatActions");
const btnMenu = document.getElementById("btnMenu");
const btnReload = document.getElementById("btnReload");
const btnOpenTab = document.getElementById("btnOpenTab");

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}

const HOME_PAGE = "popup.html";

let currentMenuPage = HOME_PAGE;

function pageUrl(path) {
  return chrome.runtime.getURL(path);
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

async function loadMenu(path) {
  currentMenuPage = path;

  const response = await fetch(pageUrl(path));
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  menuContent.innerHTML = doc.body.innerHTML;

  const checkbox = menuContent.querySelector("#openInNewTab");
  if (checkbox) {
    const { openInNewTab } = await chrome.storage.local.get("openInNewTab");
    checkbox.checked = !!openInNewTab;
    checkbox.addEventListener("change", () => {
      persist({ openInNewTab: checkbox.checked });
    });
  }

  menuView.scrollTop = 0;
}

function renderMenu() {
  chatTitle.textContent = "Ai Chat everywhere";
  chatActions.hidden = true;
  menuView.hidden = false;
  chatView.hidden = true;
}

function renderChat(url) {
  if (!url) return;

  chatTitle.textContent = hostnameOf(url);
  chatActions.hidden = false;

  // Same site = keep the frame alive so the chat session is not reset
  if (chatFrame.dataset.site !== url) {
    chatFrame.dataset.site = url;
    chatFrame.src = url;
  }

  chatView.hidden = false;
  menuView.hidden = true;
}

async function persist(values) {
  const keys = Object.keys(values);
  const stored = await chrome.storage.local.get(keys);
  const changed = {};
  for (const key of keys) {
    if (stored[key] !== values[key]) changed[key] = values[key];
  }
  if (Object.keys(changed).length) {
    await chrome.storage.local.set(changed);
  }
}

async function showMenu() {
  renderMenu();
  await persist({ lastView: "menu" });
}

async function showChat(url) {
  renderChat(url);
  await persist({ lastView: "chat", currentSite: url });
}

async function openSite(url) {
  const { openInNewTab } = await chrome.storage.local.get("openInNewTab");
  if (openInNewTab) {
    chrome.tabs.create({ url });
    return;
  }
  showChat(url);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    ta.remove();
  }
}

menuContent.addEventListener("click", (event) => {
  const copyEl = event.target.closest("[data-copy]");
  if (copyEl) {
    event.preventDefault();
    const value = copyEl.getAttribute("data-copy");
    copyToClipboard(value).then(() => {
      showToast("Copied: " + value);
      const original = copyEl.textContent;
      copyEl.textContent = "Copied ✓";
      setTimeout(() => (copyEl.textContent = original), 1500);
    });
    return;
  }

  const li = event.target.closest("li[data-website]");
  if (li) {
    openSite(li.getAttribute("data-website"));
    return;
  }

  const link = event.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || /^(https?:)?\/\//i.test(href)) return;

  event.preventDefault();
  const resolved = new URL(href, pageUrl(currentMenuPage));
  const path = resolved.pathname.replace(/^\//, "");
  if (path.endsWith(".html")) {
    loadMenu(path);
  }
});

btnMenu.addEventListener("click", showMenu);

btnReload.addEventListener("click", () => {
  const url = chatFrame.dataset.site;
  if (!url) return;
  chatFrame.removeAttribute("src");
  chatFrame.src = url;
});

btnOpenTab.addEventListener("click", () => {
  const url = chatFrame.dataset.site;
  if (url) chrome.tabs.create({ url });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.openInNewTab) {
    const checkbox = menuContent.querySelector("#openInNewTab");
    if (checkbox) checkbox.checked = !!changes.openInNewTab.newValue;
  }

  if (changes.lastView) {
    if (changes.lastView.newValue === "menu") {
      renderMenu();
    } else if (changes.lastView.newValue === "chat") {
      const site = changes.currentSite?.newValue ?? chatFrame.dataset.site;
      renderChat(site);
    }
  }
});

(async () => {
  const { currentSite, lastView } = await chrome.storage.local.get([
    "currentSite",
    "lastView"
  ]);

  await loadMenu(HOME_PAGE);

  if (currentSite && lastView === "chat") {
    renderChat(currentSite);
  } else {
    renderMenu();
  }
})();
