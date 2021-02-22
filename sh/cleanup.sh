# arguments: nginxPath -> e.g. /usr/local/nginx

# Revert change of keyboardMapping
setxkbmap de

# Disable tc
sudo tc qdisc del dev lo root

# Quit NGINX
sudo "$1"/sbin/nginx -s stop