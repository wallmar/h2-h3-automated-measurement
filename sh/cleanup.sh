# arguments: password, nginxPath -> e.g. 123456, /usr/local/nginx

# Close Browser
xdotool key "ctrl+q"

# Revert change of keyboardMapping
setxkbmap de

# Disable tc
PW=$1
echo "$PW" | sudo tc qdisc del dev lo root

# Quit NGINX
echo "$PW" | sudo "$2"/sbin/nginx -s stop