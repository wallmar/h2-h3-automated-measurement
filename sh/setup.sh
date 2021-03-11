# arguments: latency, loss, bandwidth, networkInterface -> e.g. 100 2 1024 enxa0cec83a9ce6

# emulate network
sudo tc qdisc del dev "$4" root
sudo tc qdisc add dev "$4" root netem delay "$1"ms loss "$2"%

# change keyboardMapping for xdotool
setxkbmap us
