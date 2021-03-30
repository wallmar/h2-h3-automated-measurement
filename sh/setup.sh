# arguments: latency, loss, networkInterface, samplesDomain, serverRootPassword, serverNetworkInterface -> e.g. 100, 2, enxa0cec83a9ce6, mmtsample.hopto.org, mmtsample, enxa0cec83a9ce6

# emulate network (egress for client)
sudo tc qdisc del dev "$3" root
sudo tc qdisc add dev "$3" root netem delay "$1"ms loss "$2"%

# emulate network (egress for server)
sshpass -p "$5" ssh -oStrictHostKeyChecking=no root@"$4" tc qdisc del dev "$6" root
if sshpass -p "$5" ssh -oStrictHostKeyChecking=no root@"$4" tc qdisc add dev "$6" root netem delay "$1"ms loss "$2"% ; then
    # change keyboardMapping for xdotool
    setxkbmap us
else
    exit
fi
