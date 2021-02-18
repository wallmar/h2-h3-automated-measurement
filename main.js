const fs = require('fs')
const glob = require('glob')
const excelJS = require('exceljs');

// e.g. 3 100 0.1 1024 (version, latency, packet loss, bandwidth)
const [version, latency, loss, bandwidth] = process.argv.slice(2);

const getLoadTime = raw => JSON.parse(raw).log?.pages[0]?.pageTimings?.onLoad

const writeResult = async result => {
    const workbook = new excelJS.Workbook()
    const data = [latency, bandwidth, loss, version === '3' ? '' : result, version === '3' ? result : '']

    if (!fs.existsSync('./results.xlsx')){
        await createNewWorkbook(workbook)
    }

    await workbook.xlsx.readFile('./results.xlsx')
    const sheet = workbook.getWorksheet('Results')

    const rows = sheet.getRows(1, sheet.actualRowCount)
    let existingSettings = false

    rows.forEach(row => {
        const latencyTmp = row.getCell(1).value
        const bandwidthTmp = row.getCell(2).value
        const lossTmp = row.getCell(3).value

        // If entry for same network setting already exists -> update
        if (latencyTmp === latency && bandwidthTmp === bandwidth && lossTmp === loss) {
            existingSettings = true
            const cell = version === '3' ? 4 : 5
            const pltTmp = row.getCell(cell).value
            row.values = data
            row.getCell(cell).value = pltTmp
        }
    })

    if (!existingSettings){
        sheet.addRow(data);
    }

    await workbook.xlsx.writeFile('./results.xlsx');
}

const createNewWorkbook = async workbook => {
    console.log('Generating new File ...')

    workbook.creator = 'Markus Wallner'
    workbook.lastModifiedBy = 'Markus Wallner'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = true;

    const sheet = workbook.addWorksheet('Results')
    sheet.columns = [
        {header: 'Latenz', key: 'latency', width: 30},
        {header: 'Bandbreite', key: 'bandwidth', width: 30},
        {header: 'Paketverlustrate', key: 'loss', width: 30},
        {header: 'PLT - HTTP/2', key: 'h2', width: 30},
        {header: 'PLT - HTTP/3', key: 'h3', width: 30}
    ];

    await workbook.xlsx.writeFile('./results.xlsx');
}

let loadTimes = []

glob("/home/mwallner/har-files/*.har", {}, (err, files) => {
    files.forEach(file => {
        loadTimes.push(getLoadTime(fs.readFileSync(file)))
    })

    if (!files.length > 0) {
        console.log("No HAR-Files provided")
        return
    }

    const avgLoadTime = loadTimes.reduce((acc, curr) => {
        return acc + curr
    })/loadTimes.length

    writeResult(avgLoadTime)
})
