# arguments: url, version -> sample-00, 2
if [[ $# -le 1 ]]; then
  echo "too few arguments"
  exit 1
fi

# start Chromium
if [ "$2" = '02' ]; then
  chromium --auto-open-devtools-for-tabs &
else
  chromium --enable-quic --quic-version=h3-29 --origin-to-force-quic-on="$1":443 --auto-open-devtools-for-tabs &
fi
sleep 1

# go to host
sleep 0.5
xdotool key "ctrl+l"
sleep 0.5
xdotool type --delay 50 "https://$1"
xdotool key "Return"
