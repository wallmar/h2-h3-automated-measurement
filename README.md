# h2-h3-automated-measurement
Tool for automated performance measurement of h2 and h3 by Markus Wallner <mwallner.mmt-b2018@fh-salzburg.ac.at>

## Dependencies
* Latest version of Firefox Nightly. After installation go to about:config and set __network.http.http3.enabled__ to __true__
* Manually installed Nginx from quic-branch. Refer to https://hg.nginx.org/nginx-quic/file/quic/README for installation. But use this command for configuration (this also enables http2):<br/><br/>
  __./auto/configure --with-debug --with-http_v3_module --with-cc-opt="-I../boringssl/include" --with-ld-opt="-L../boringssl/build/ssl -L../boringssl/build/crypto" --with-http_v2_module__ <br/><br/>(Please note that nginx requires boringssl)

## Configuration
* Rename ``.env.sample`` to ``.env`` and replace 'SECRET_SUDO_PASSWORD' with your password
* In ``config.js`` replace the variable __harFilesPath__ with your Path to the Firefox-Trunk-HAR-Files. If you specified another Directory for your nginx-installation, also change __nginxPath__

## Usage
e.g. for HTTP/3 with 100ms latency, 2 % loss and 1024 bandwidth

``node main.js 3 100 0.2 1024``