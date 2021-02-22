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
                const date = new Date()
                const formattedDate = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
                const hostName = new URL(tab.url).host

                if (hostName.startsWith('sample-')) {
                    // eslint-disable-next-line no-undef
                    chrome.downloads.download({
                        filename: `har/${hostName}-${formattedDate}`,
                        url
                    });
                }
            })
        }, 1000);
    }
})