# arguments: password, version, latency, loss, bandwidth, samplesCount, nginxPath -> e.g. 123456 3 100 0.1 1024 50 /usr/local/nginx

# clearing /sites-available and /sites-enabled ...
rm "$7"/conf/sites-available/*
rm "$7"/conf/sites-enabled/*

i=0
while [ "$i" -le "$(($6-1))" ]; do
  num="00"
  if [ "$i" -gt "9" ]
  then
      num="${i}"
  else
      num="0${i}"
  fi

  # Creating VHosts for sample
  sed "s/-00/-$num/g" vhosts/sample.h"$2" > "$7"/conf/sites-available/sample-$num
  ln -s "$7"/conf/sites-available/sample-$num "$7"/conf/sites-enabled

  i=$((i + 1))
done

# Start NGINX
PW=$1
echo "$PW" | sudo "$7"/sbin/nginx -s stop
sleep 3
echo "$PW" | sudo "$7"/sbin/nginx

# Emulate Network
# TODO bandwidth still missing
echo "$PW" | sudo tc qdisc del dev lo root
echo "$PW" | sudo tc qdisc add dev lo root netem delay "$3"ms loss "$4"
# Change keyboardMapping for xdotool
setxkbmap us