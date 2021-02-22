# arguments: version, latency, loss, bandwidth, samplesCount, nginxPath -> e.g. 3 100 0.1 1024 50 /usr/local/nginx

# clearing /sites-available and /sites-enabled ...
rm "$6"/conf/sites-available/*
rm "$6"/conf/sites-enabled/*

# update certificate and key
sudo mkdir -p /etc/ssl/self-signed
sudo cp ssl/h2-h3.crt /etc/ssl/self-signed
sudo cp ssl/h2-h3.key /etc/ssl/self-signed

# update /etc/hosts
if ! sudo grep -q "sample-00" /etc/hosts; then
  i=0
  while [ "$i" -le "$(($5-1))" ]; do
    num="00"
    if [ "$i" -gt "9" ]
    then
        num="${i}"
    else
        num="0${i}"
    fi

    printf "127.0.0.1\tsample-%s\n" "$num"| sudo tee --append /etc/hosts

    i=$((i + 1))
  done
fi

# replace nginx-conf
cp nginx-config/nginx.conf "$6"/conf

i=0
while [ "$i" -le "$(($5-1))" ]; do
  num="00"
  if [ "$i" -gt "9" ]
  then
      num="${i}"
  else
      num="0${i}"
  fi

  # create VHosts for sample
  sed "s/-00/-$num/g" nginx-config/sample.h"$1" > "$6"/conf/sites-available/sample-$num
  ln -s "$6"/conf/sites-available/sample-$num "$6"/conf/sites-enabled

  i=$((i + 1))
done

# start Nginx
sudo "$6"/sbin/nginx -s stop
sleep 3
sudo "$6"/sbin/nginx

# emulate network
sudo tc qdisc del dev lo root
sudo tc qdisc add dev lo root netem delay "$2"ms loss "$3"

# change keyboardMapping for xdotool
setxkbmap us