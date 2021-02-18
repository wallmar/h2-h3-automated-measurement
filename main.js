const fs = require('fs')
const { writeResult } = require('./excelExtension')
const { isValidProtocol, getLoadTime } = require('./harExtension')
const chokidar = require('chokidar')
const execAwait = require('await-exec')
const { exec } = require('child_process')

// e.g. 3 100 0.1 1024 (version, latency, packet loss, bandwidth)
// eslint-disable-next-line no-undef
const [version, latency, loss, bandwidth] = process.argv.slice(2);

const padNumber = num => num.toString().padStart(2, '0')

async function run() {
    let loadTimes = []
    let currentSample = 0

    console.log('Removing all HAR-Files ...')
    try {
        await execAwait('rm -r /home/mwallner/.mozilla/firefox-trunk/xjj2st1m.default-nightly/har/logs/*')
    }
    catch(e) {}

    // Listen for new HAR-Files
    const watcher = chokidar.watch('/home/mwallner/.mozilla/firefox-trunk/xjj2st1m.default-nightly/har/logs')
    watcher.on('add', async path => {
        const har = fs.readFileSync(path)
        if (isValidProtocol(har, version)) {
            // Disable dev-tools
            await execAwait('xdotool key "ctrl+shift+e"')

            // Update loadTimes and sampleNumber
            loadTimes.push(getLoadTime(har))
            currentSample++

            if (currentSample < 3) {
                // Generate HAR-File of next sample
                await execAwait(`./getHar.sh sample-${padNumber(currentSample)} ${windowId}`)
            }
            else {
                // Stop listening for new HAR-Files
                await watcher.close()

                // Close Browser
                await execAwait('xdotool key "ctrl+q"')

                // Calculate average loadTime
                const avgLoadTime = loadTimes.reduce((acc, curr) => {
                    return acc + curr
                })/loadTimes.length

                console.log('Writing Results ...')
                await writeResult(avgLoadTime, latency, bandwidth, loss, version)

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
    await execAwait(`./getHar.sh sample-${padNumber(currentSample)} ${windowId}`)
}

run()