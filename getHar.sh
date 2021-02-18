# arguments: url -> sample-00
if [[ $# -le 0 ]]; then
  echo "too few arguments"
  exit 1
fi

firefox-trunk $1 &
sleep 0.5
WID=$(xdotool search nightly | tail -n1)
xdotool windowactivate --sync $WID
sleep 0.3
xdotool key "ctrl+shift+e"
sleep 1
xdotool key "ctrl+F5"
sleep 1
xdotool key "F5"
sleep 3
xdotool key "ctrl+w"
