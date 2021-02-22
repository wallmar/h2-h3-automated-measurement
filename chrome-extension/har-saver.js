chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.status === "complete") {
        setTimeout(() => {
            chrome.devtools.network.getHAR(harLog => {
                let harObj = {}
                harObj.log = harLog

                let blob = new Blob([JSON.stringify(harObj)])
                let url = URL.createObjectURL(blob);
                const date = new Date()
                const formattedDate = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`

                chrome.downloads.download({
                    filename: `har/${new URL(tab.url).host}-${formattedDate}`,
                    url
                });
            })
        }, 1000);
    }
})