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

document.addEventListener("click", (event) => {
  const copyEl = event.target.closest("[data-copy]");
  if (!copyEl) return;
  event.preventDefault();
  const value = copyEl.getAttribute("data-copy");
  copyToClipboard(value).then(() => {
    const original = copyEl.textContent;
    copyEl.textContent = "Copied ✓";
    setTimeout(() => (copyEl.textContent = original), 1500);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const checkbox = document.getElementById("openInNewTab");
  const { openInNewTab } = await chrome.storage.local.get("openInNewTab");

  if (checkbox) {
    checkbox.checked = !!openInNewTab;
    checkbox.addEventListener("change", () => {
      chrome.storage.local.set({ openInNewTab: checkbox.checked });
    });
  }

  document.querySelectorAll("li[data-website]").forEach((li) => {
    li.addEventListener("click", async () => {
      const url = li.getAttribute("data-website");
      const { openInNewTab } = await chrome.storage.local.get("openInNewTab");

      if (openInNewTab) {
        chrome.tabs.create({ url });
        return;
      }

      await chrome.storage.local.set({ lastView: "chat", currentSite: url });

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (error) {
        console.error("Could not open the side panel:", error);
        chrome.tabs.create({ url });
      }
    });
  });
});
