const fs = require('fs')
const { config } = require('./config')
const { writeResults } = require('./src/excelExtension')
const { getValidRequestCount, getLoadTime } = require('./src/harExtension')
const chokidar = require('chokidar')
const execAwait = require('await-exec')
const { Mutex } = require('async-mutex')
const { exec } = require('child_process')

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
    const mutex = new Mutex()
    for(const version of ['2', '3']) {
        // eslint-disable-next-line no-await-in-loop
        const release = await mutex.acquire()
        // eslint-disable-next-line no-await-in-loop
        await runForVersion(release, version, latency, loss, bandwidth)
    }
    console.log('Finished')
}

async function runForVersion(release, version, latency, loss, bandwidth) {
    console.log(`Setting up Nginx and TC for ${getVersionName(version)}...`)
    await execAwait(`./sh/setup.sh ${config.password} ${version} ${latency} ${loss} ${bandwidth} ${config.samplesCount} ${config.nginxPath}`)

    let results = []
    let currentSample = 0
    const sleep = Math.max(2, latency * 5 / 1000)

    console.log('Removing all HAR-Files ...')
    try {
        await execAwait(`rm -r ${config.harFilesPath}/*`)
    }
    catch(e) {}

    // Listen for new HAR-Files
    const watcher = chokidar.watch(config.harFilesPath)
    watcher.on('add', async path => {
        const har = fs.readFileSync(path)
        const requestCount = getValidRequestCount(har, version)
        if (requestCount) {
            // Disable dev-tools
            await execAwait('xdotool key "ctrl+shift+e"')

            // Update results and sampleNumber
            const sample = `sample-${padNumber(currentSample)}`
            const loadTime = getLoadTime(har)
            console.log(`${getVersionName(version)} - ${sample}: ${loadTime}ms`)
            results.push({
                loadTime,
                requestCount,
                sample
            })
            currentSample++

            if (currentSample < 3) {
                // Generate HAR-File of next sample
                await execAwait(`./sh/getHar.sh sample-${padNumber(currentSample)} ${sleep} ${windowId}`)
            }
            else {
                // Stop listening for new HAR-Files
                await watcher.close()

                // CleanupRoutine
                console.log(`Measuring for ${getVersionName(version)} complete. Cleaning up ...`)
                await execAwait(`./sh/cleanup.sh ${config.password} ${config.nginxPath}`)

                console.log('Writing Results ...')
                await writeResults(results, latency, bandwidth, loss, version)
                release()
            }
        }
        else {
            // Delete invalid HAR-File
            fs.unlinkSync(path)

            // Generate another HAR-File
            await execAwait('xdotool key "F5"')
        }
    })

    // Start Firefox
    console.log('Starting measurement ...')
    exec('firefox-trunk &')

    // windowId is used for xdotool
    const windowId = (await execAwait('sleep 2; xdotool search nightly | tail -n1')).stdout
    await execAwait(`./sh/getHar.sh sample-${padNumber(currentSample)} ${sleep} ${windowId}`)
}

run()