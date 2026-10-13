// List of URLs to delete from history
const linksToRemove = [
    "https://chatgpt.com",
    "https://gemini.google.com/app",
    "https://copilot.microsoft.com/",
    "https://www.bing.com/images/create/",
    "https://chat.deepseek.com/",
    "https://duckduckgo.com/?q=DuckDuckGo&ia=chat",
    "https://www.perplexity.ai/",
    "https://poe.com",
    "https://you.com/search?q=hi&fromSearchBar=true&tbm=youchat",
    "https://app.suno.ai/create/",
    "https://www.udio.com/create"
];

// Clicking the toolbar icon opens the side panel (Chrome has no sidebar_action)
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("setPanelBehavior failed:", error));

async function deleteHistory() {
    console.log("Starting history cleanup...");

    for (const url of linksToRemove) {
        try {
            const results = await chrome.history.search({ text: url, maxResults: 1 });
            if (results.length > 0) {
                await chrome.history.deleteUrl({ url });
                console.log(`Deleted history for ${url}`);
            } else {
                console.log(`URL not found in history: ${url}`);
            }
        } catch (error) {
            console.error(`Failed to delete ${url}:`, error);
        }
    }

    console.log("History cleanup completed.");
}

async function runOnceDaily() {
    const storage = await chrome.storage.local.get("lastRun");
    const lastRun = storage.lastRun || 0;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now - lastRun > oneDay) {
        console.log("Running cleanup...");
        await deleteHistory();
        await chrome.storage.local.set({ lastRun: now });
    } else {
        console.log("Cleanup already ran today. Skipping...");
    }
}

runOnceDaily();
