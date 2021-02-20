# arguments: nginxPath -> e.g. /usr/local/nginx

# Close Browser
xdotool key "ctrl+q"

# Revert change of keyboardMapping
setxkbmap de

# Disable tc
sudo tc qdisc del dev lo root

# Quit NGINX
sudo "$1"/sbin/nginx -s stop