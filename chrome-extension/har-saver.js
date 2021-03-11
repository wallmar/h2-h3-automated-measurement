// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.status === "complete") {
        setTimeout(() => {
            // eslint-disable-next-line no-undef
            chrome.devtools.network.getHAR(harLog => {
                let harObj = {}
                harObj.log = harLog

                let blob = new Blob([JSON.stringify(harObj)])
                let url = URL.createObjectURL(blob);
                // eslint-disable-next-line require-unicode-regexp
                const path = new URL(tab.url).pathname.replace(/\/+$/, '')

                if (tab.url.includes('sample-')) {
                    // eslint-disable-next-line no-undef
                    chrome.downloads.download({
                        filename: `har/${path}`,
                        url
                    });
                }
            })
        }, 1000);
    }
})