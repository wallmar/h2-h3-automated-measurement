const getTotalStartTime = pages => {
    const startTimes = pages.map(page => new Date(page.startedDateTime))
    return new Date(Math.min.apply(null, startTimes))
}

/*
Extracts the total loadTime of given HAR-File by calculating the timestamp between first request and latest response
 */
exports.getLoadTime = raw => {
    // Source: https://stackoverflow.com/questions/30745931/how-to-get-total-web-page-response-time-from-a-har-file
    const har = JSON.parse(raw)
    const totalStartTime = getTotalStartTime(har.log.pages)
    let loadTime = totalStartTime
    har.log.entries.forEach(entry => {
        const entryStartTime = new Date(entry.startedDateTime)
        const entryLoadTime = entryStartTime.setMilliseconds(entryStartTime.getMilliseconds() + entry.time)

        if (entryLoadTime > loadTime)
            loadTime = entryLoadTime
    })
    return loadTime - totalStartTime
}

/*
Checks if responses in given HAR-File have the correct version. Is also used to count number of requests
 */
exports.getValidRequestCount = (raw, version) => {
    let har = null
    try {
        har = JSON.parse(raw)
    }
    catch (e) {
        return 0
    }

    const protocol = version.toString() === '3' ? 'HTTP/3' : 'HTTP/2'
    let isValid = true
    let requestCount = 0

    har.log.entries.forEach(entry => {
        if (entry.response.httpVersion !== protocol && entry.response.httpVersion !== '') {
            isValid = false;
        }
        requestCount++
    })
    return isValid ? requestCount : 0
}