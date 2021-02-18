# arguments: url -> sample-00
if [[ $# -le 0 ]]; then
  echo "too few arguments"
  exit 1
fi

firefox-trunk $1 &
sleep 2
WID=$(xdotool search nightly | tail -n1)
xdotool windowactivate --sync $WID
sleep 0.5
xdotool windowmove $WID 0 0
xdotool key "ctrl+shift+e"
sleep 1.5
xdotool key "ctrl+F5"
sleep 1
xdotool key "F5"
sleep 2
xdotool mousemove 261 658 click 3
xdotool mousemove 394 698 click 1
sleep 0.5
xdotool mousemove 151 137 click 1
xdotool mousemove 308 346 click 1 click 1
xdotool mousemove 1299 96 click 1
sleep 0.5
xdotool key "ctrl+q"
