# arguments: networkInterface -> e.g. enxa0cec83a9ce6

# Revert change of keyboardMapping
setxkbmap de

# Disable tc
sudo tc qdisc del dev "$1" root