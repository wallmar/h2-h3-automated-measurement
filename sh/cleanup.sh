# arguments: networkInterface, samplesDomain, serverRootPassword, serverNetworkInterface -> e.g. enxa0cec83a9ce6, mmtsample.hopto.org, mmtsample, enxa0cec83a9ce6

# revert change of keyboardMapping
setxkbmap de

# disable tc (egress for client)
sudo tc qdisc del dev "$1" root

# disable tc (egress for server)
sshpass -p "$3" ssh -oStrictHostKeyChecking=no root@"$2" tc qdisc del dev "$4" root