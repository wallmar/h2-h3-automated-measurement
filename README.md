# h2-h3-automated-measurement
Tool for automated performance measurement of h2 and h3 by Markus Wallner <mwallner.mmt-b2018@fh-salzburg.ac.at>

## Dependencies
* Ubuntu (worked with Ubuntu 20.04.2 LTS)
* Chromium (worked with 88.0.4324.182)
* xdotool
* node and npm
* Manually installed Nginx from quic-branch. Refer to https://hg.nginx.org/nginx-quic/file/quic/README for installation. But use this command for configuration (this also enables http2):<br/><br/>
  __./auto/configure --with-debug --with-http_v3_module --with-cc-opt="-I../boringssl/include" --with-ld-opt="-L../boringssl/build/ssl -L../boringssl/build/crypto" --with-http_v2_module__ <br/><br/>
  Also execute ``sudo make install`` after ``make``. This step is missing in the README of nginx-quic.<br><br>
  _Please note that nginx has several dependencies including boringssl. For __boringssl__ refer to https://www.craftsmany.net/boringssl-als-openssl-ersatz-mit-nginx-from-source/ (1-3)_.

## Configuration
* In ``config.js`` replace the variable __downloadsPath__ with your Downloads-Location for Chromium. If you specified another Directory for your nginx-installation, also change __nginxPath__
* Add the Chrome Extension in ``/chrome-extension`` to Chromium (this enables auto-download of HAR):
  1. Open Chromium
  2. Go to __chrome://extensions/__
  3. Enable Developer Mode
  4. Click at __"Load unpacked"__ and select the ``/chrome-extension``-folder from this repository
* Import the Authority of the self-signed certificate to Chromium:
  1. Go to Settings > Privacy and Security > Security > Manage certificates > Authorities > Import
  2. Select  [CA.pem](./ssl/CA.pem) within ``/ssl``
  3. Check __"Trust this certificate for identifying websites"__ and click __"ok"__
* Unzip and add the websites to be measured in ``/samples`` in your nginx-path, _default: ``/usr/local/nginx/samples``_
* Execute ``npm i``

## Usage
e.g. for with 100ms latency, 2 % loss and 1024 bandwidth (performed for HTTP/3 and HTTP/2)

``node main.js 100 0.02 1024``

This creates entries in results.xlsx. If the file does not exist, it is created automatically. If a measurement is performed with the same parameters, the according entries in results.xlsx is replaced.

___Important:__ Before starting the measurement, close all instances of Chromium_