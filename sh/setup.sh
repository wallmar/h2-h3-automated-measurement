# arguments: latency, loss, bandwidth -> e.g. 100 2 1024

# emulate network
sudo tc qdisc del dev lo root
sudo tc qdisc add dev lo root netem delay "$1"ms loss "$2"%

# change keyboardMapping for xdotool
setxkbmap us
