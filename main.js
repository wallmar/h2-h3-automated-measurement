const fs = require('fs')
const { config } = require('./config')
const { writeResults } = require('./src/excelExtension')
const { getValidRequestCount, getLoadTime } = require('./src/harExtension')
const chokidar = require('chokidar')
const execAwait = require('await-exec')
const { exec } = require('child_process')

const padNumber = num => num.toString().padStart(2, '0')

const validArgs = args => {
    if (args.length < 6)
        return false
    if (!['2', '3'].includes(args[2]))
        return false
    return !(isNaN(args[2]) || isNaN(args[3]) || isNaN(args[4]) || isNaN(args[5]))
}

async function run() {
    // eslint-disable-next-line no-undef
    const args = process.argv
    if (!validArgs(args)) {
        console.log('Invalid arguments')
        return
    }
    // e.g. 3 100 0.1 1024 (version, latency, loss, bandwidth)
    const [version, latency, loss, bandwidth] = args.slice(2);

    console.log('Setting up Nginx and TC ...')
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
            console.log(`${sample}: ${loadTime}ms`)
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
                console.log('Measuring complete. Cleaning up ...')
                await execAwait(`./sh/cleanup.sh ${config.password} ${config.nginxPath}`)

                console.log('Writing Results ...')
                await writeResults(results, latency, bandwidth, loss, version)

                console.log('Finished')
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