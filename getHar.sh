# arguments: url, sleep, WID -> sample-00 3 39843344
if [[ $# -le 1 ]]; then
  echo "too few arguments"
  exit 1
fi

setxkbmap us
xdotool windowactivate --sync "$3"
sleep 0.5
xdotool key "ctrl+l"
sleep 0.5
xdotool type --delay 50 "https://$1"
setxkbmap de
xdotool key "Return"
sleep "$2"
xdotool key "ctrl+F5"
sleep 0.5
xdotool key "ctrl+shift+e"
sleep 1
xdotool key "F5"
