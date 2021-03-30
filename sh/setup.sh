# arguments: latency, loss, bandwidth, networkInterface, host, password, serverNetworkInterface -> e.g. 100, 2, 1024, enxa0cec83a9ce6, mmtsample.hopto.org, mmtsample, enxa0cec83a9ce6

# emulate network (egress for client)
sudo tc qdisc del dev "$4" root
sudo tc qdisc add dev "$4" root netem delay "$1"ms loss "$2"%

# emulate network (egress for server)
sshpass -p "$6" ssh -oStrictHostKeyChecking=no root@"$5" tc qdisc del dev "$7" root
if sshpass -p "$6" ssh -oStrictHostKeyChecking=no root@"$5" tc qdisc add dev "$7" root netem delay "$1"ms loss "$2"% ; then
    # change keyboardMapping for xdotool
    setxkbmap us
else
    exit
fi
