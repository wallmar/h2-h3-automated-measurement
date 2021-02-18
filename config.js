require('dotenv').config();

exports.config = {
    harFilesPath: '/home/mwallner/.mozilla/firefox-trunk/xjj2st1m.default-nightly/har/logs',
    nginxPath: '/usr/local/nginx',
    // eslint-disable-next-line no-undef
    password: process.env.PASSWORD,
    samplesCount: 50
};