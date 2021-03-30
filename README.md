# h2-h3-automated-measurement
Tool for automated performance measurement of h2 and h3 by Markus Wallner <mwallner.mmt-b2018@fh-salzburg.ac.at>

## Dependencies
* Ubuntu (worked with Ubuntu 20.04.2 LTS)
* Chromium (worked with 89.0.4389.82)
* xdotool
* npm
* node
* sshpass

## Configuration
* In ``config.js`` 
  1. set the variable __downloadsPath__ to your Downloads-Location for Chromium.
  2. set the variable __networkInterface__ to your network interface (ip addr show)
  3. set the variable __samplesCount__ to the total count of samples provided by the webserver
  3. set the variable __samplesDomain__ to the domain of the webserver
  4. set the variable __serverNetworkInterface__ to the network interface of the webserver (ip addr show)
  5. set the variable __serverRootPassword__ to the root password of the webserver (webserver must have enabled ssh and permit login as root - ___Please permit login as root only for the IP-Address of the client for security reasons___)
* Add the Chrome Extension in ``/chrome-extension`` to Chromium (this enables auto-download of HAR):
  1. Open Chromium
  2. Go to __chrome://extensions/__
  3. Enable Developer Mode
  4. Click at __"Load unpacked"__ and select the ``/chrome-extension``-folder from this repository
* Execute ``npm i``

## Usage
e.g. for with 100ms latency, 2 % loss and 1024 bandwidth (performed for HTTP/3 and HTTP/2)

``node main.js 100 2 1024``

This creates entries in results.xlsx. If the file does not exist, it is created automatically. If a measurement is performed with the same parameters, the according entries in results.xlsx is replaced.

___Important:___ Before starting the measurement, close all instances of Chromium_
