# arguments: url -> sample-00, WID -> 39843344
if [[ $# -le 1 ]]; then
  echo "too few arguments"
  exit 1
fi

setxkbmap us
xdotool windowactivate --sync "$2"
sleep 0.5
xdotool key "ctrl+l"
sleep 0.5
xdotool type --delay 50 "https://$1"
setxkbmap de
xdotool key "Return"
sleep 0.5
xdotool key "ctrl+F5"
sleep 0.5
xdotool key "ctrl+shift+e"
sleep 1
xdotool key "F5"
