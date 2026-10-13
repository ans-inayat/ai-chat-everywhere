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
