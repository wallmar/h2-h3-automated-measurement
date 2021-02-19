const fs = require('fs')
const excelJS = require('exceljs')

const createNewWorkbook = async workbook => {
    workbook.creator = 'Markus Wallner'
    workbook.lastModifiedBy = 'Markus Wallner'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.properties.date1904 = true;

    const sheet = workbook.addWorksheet('Results')
    sheet.columns = [
        {header: 'Website', key: 'sample', width: 30},
        {header: 'Requests', key: 'request-count', width: 30},
        {header: 'Latenz', key: 'latency', width: 30},
        {header: 'Bandbreite', key: 'bandwidth', width: 30},
        {header: 'Paketverlustrate', key: 'loss', width: 30},
        {header: 'PLT - HTTP/2', key: 'h2', width: 30},
        {header: 'PLT - HTTP/3', key: 'h3', width: 30}
    ];

    await workbook.xlsx.writeFile('./results.xlsx');
}

/*
Used to write result in Excel-file (results.xlsx) and is able to override results when network condition was already measured
 */
const writeResult = async (result, latency, bandwidth, loss, version) => {
    const workbook = new excelJS.Workbook()
    const data = [result.sample, result.requestCount, latency, bandwidth, loss, version === '3' ? '' : result.loadTime, version === '3' ? result.loadTime : '']

    if (!fs.existsSync('./results.xlsx')){
        await createNewWorkbook(workbook)
    }

    await workbook.xlsx.readFile('./results.xlsx')
    const sheet = workbook.getWorksheet('Results')

    const rows = sheet.getRows(1, sheet.actualRowCount)
    let existingSettings = false

    rows.forEach(row => {
        const sampleTmp = row.getCell(1).value
        const latencyTmp = row.getCell(3).value
        const bandwidthTmp = row.getCell(4).value
        const lossTmp = row.getCell(5).value

        // If entry for same network setting already exists -> update
        if (sampleTmp === result.sample && latencyTmp === latency && bandwidthTmp === bandwidth && lossTmp === loss) {
            existingSettings = true
            const cell = version === '3' ? 6 : 7
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

exports.writeResults = async (results, latency, bandwidth, loss, version) => {
    for (const result of results) {
        // can not be async because read- and write-operations in same Excel-File
        // eslint-disable-next-line no-await-in-loop
        await writeResult(result, latency, bandwidth, loss, version)
    }
}