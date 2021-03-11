# arguments: domain, sample, version -> e.g. mmtsample.hopto.org sample-00, 02
if [[ $# -le 1 ]]; then
  echo "too few arguments"
  exit 1
fi

# start Chromium
if [ "$3" = '02' ]; then
  chromium --disable-quic --auto-open-devtools-for-tabs --disk-cache-dir=/dev/null &
else
  chromium --enable-quic --quic-version=h3-29 --origin-to-force-quic-on="$1":443 --auto-open-devtools-for-tabs --disk-cache-dir=/dev/null &
fi
sleep 1

# go to host
sleep 0.5
xdotool key "ctrl+l"
sleep 0.5
xdotool type --delay 50 "https://$1/$2"
xdotool key "Return"
