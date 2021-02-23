const fs = require('fs')
const { config } = require('./config')
const { writeResults } = require('./src/excelExtension')
const { getValidRequestCount, getLoadTime } = require('./src/harExtension')
const chokidar = require('chokidar')
const execAwait = require('await-exec')
const { Mutex } = require('async-mutex')

const padNumber = num => num.toString().padStart(2, '0')
const getVersionName = version => `HTTP/${version}`

const validArgs = args => {
    if (args.length < 5)
        return false
    return !(isNaN(args[2]) || isNaN(args[3]) || isNaN(args[4]))
}

async function run() {
    // eslint-disable-next-line no-undef
    const args = process.argv
    if (!validArgs(args)) {
        console.log('Invalid arguments')
        return
    }
    // e.g. 100 0.1 1024 (latency, loss, bandwidth)
    const [latency, loss, bandwidth] = args.slice(2);

    // run for HTTP/2 and HTTP/3
    for(const version of ['2', '3']) {
        // eslint-disable-next-line no-await-in-loop
        await runForVersion(version, latency, loss, bandwidth)
    }
    console.log('Finished')
}

async function runForVersion(version, latency, loss, bandwidth) {
    const performMeasurementFor = async(currentSample, ver) => {
        await execAwait(`./sh/getHar.sh sample-${padNumber(currentSample)} ${padNumber(ver)}`)
    }
    const handleHarAdded = path => {
        // ignore .crdownload
        if (path.endsWith('.crdownload'))
            return

        // sometimes 2 identical HAR-Files are saved
        if (path.includes('('))
            return

        let harRaw = ''
        const readStream = fs.createReadStream(path)

        readStream.on('data', chunk => {
            harRaw += chunk.toString('utf-8')
        })

        readStream.on('end', async () => {
            // Close Chromium
            await execAwait('sleep 0.5')
            await execAwait('xdotool key "ctrl+shift+w"')

            const requestCount = getValidRequestCount(harRaw, version)
            if (requestCount) {
                // Update results and sampleNumber
                const sample = `sample-${padNumber(currentSample)}`
                const loadTime = getLoadTime(harRaw)
                console.log(`${getVersionName(version)} - ${sample}: ${loadTime}ms`)
                results.push({
                    loadTime,
                    requestCount,
                    sample
                })
                currentSample++

                if (currentSample < config.samplesCount) {
                    // Generate HAR-File of next sample
                    await performMeasurementFor(currentSample, version)
                }
                else {
                    // Stop listening for new HAR-Files
                    await watcher.close()

                    // CleanupRoutine
                    console.log(`Measuring for ${getVersionName(version)} complete. Cleaning up ...`)
                    await execAwait(`./sh/cleanup.sh ${config.nginxPath}`)

                    console.log('Writing Results ...')
                    await writeResults(results, latency, bandwidth, loss, version)

                    // Release Mutex
                    release()
                }
            }
            else {
                // Delete invalid HAR-File
                fs.unlinkSync(path)

                // Generate HAR-File of same sample
                await performMeasurementFor(currentSample, version)
            }
        })
    }
    const mutex = new Mutex()
    const release = await mutex.acquire()

    console.log(`Setting up Nginx and TC for ${getVersionName(version)}...`)
    await execAwait(`./sh/setup.sh ${version} ${latency} ${loss} ${bandwidth} ${config.samplesCount} ${config.nginxPath}`)

    let results = []
    let currentSample = 0

    console.log('Removing all HAR-Files ...')
    try {
        await execAwait(`rm -r ${config.downloadsPath}/har/*`)
    }
    catch(e) {}

    // Listen for new HAR-Files
    const watcher = chokidar.watch(`${config.downloadsPath}/har`)
    watcher.on('add', handleHarAdded)

    // Start Firefox
    console.log('Starting measurement ...')
    await performMeasurementFor(currentSample, version)
    await mutex.acquire()
}

run()