# arguments: version, latency, loss, bandwidth, samplesCount, nginxPath -> e.g. 3 100 0.1 1024 50 /usr/local/nginx

# clearing /sites-available and /sites-enabled ...
rm "$6"/conf/sites-available/*
rm "$6"/conf/sites-enabled/*

i=0
while [ "$i" -le "$(($5-1))" ]; do
  num="00"
  if [ "$i" -gt "9" ]
  then
      num="${i}"
  else
      num="0${i}"
  fi

  # Creating VHosts for sample
  sed "s/-00/-$num/g" vhosts/sample.h"$1" > "$6"/conf/sites-available/sample-$num
  ln -s "$6"/conf/sites-available/sample-$num "$6"/conf/sites-enabled

  i=$((i + 1))
done

# Start NGINX
sudo "$6"/sbin/nginx -s stop
sleep 3
sudo "$6"/sbin/nginx

# Emulate Network
# TODO bandwidth still missing
sudo tc qdisc del dev lo root
sudo tc qdisc add dev lo root netem delay "$2"ms loss "$3"
# Change keyboardMapping for xdotool
setxkbmap us