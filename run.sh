# arguments: password, version, latency, packet loss, bandwidth -> e.g. 123456 3 100 0.1 1024
if [[ $# -le 4 ]]; then
  echo "too few arguments"
  exit 1
fi

PW=$1

echo "clearing /sites-available and /sites-enabled ..."
rm /usr/local/nginx/conf/sites-available/*
rm /usr/local/nginx/conf/sites-enabled/*

i=0
while [ "$i" -le "49" ]; do
  num="00"
  if [ "$i" -gt "9" ]
  then
      num="${i}"
  else
      num="0${i}"
  fi

  echo "Creating VHosts for sample [$num of 50]"

  if [[ "$2" == "2" ]]; then
    sed "s/-00/-$num/g" /usr/local/nginx/conf/sample.h2 > /usr/local/nginx/conf/sites-available/sample-$num
    ln -s /usr/local/nginx/conf/sites-available/sample-$num /usr/local/nginx/conf/sites-enabled
  else
    sed "s/-00/-$num/g" /usr/local/nginx/conf/sample.h3 > /usr/local/nginx/conf/sites-available/sample-$num
    ln -s /usr/local/nginx/conf/sites-available/sample-$num /usr/local/nginx/conf/sites-enabled
  fi

  i=$((i + 1))
done

# Start NGINX
echo $PW | sudo /usr/local/nginx/sbin/nginx -s stop
sleep 3
echo $PW | sudo /usr/local/nginx/sbin/nginx

# Emulate Network
# TODO bandwidth still missing
echo $PW | sudo tc qdisc add dev lo root netem delay ${3}ms loss $4

echo "clearing /har-files ..."
rm ~/har-files/*

j=0
while [ "$j" -le "4" ]; do
  num="00"
  if [ "$j" -gt "9" ]
  then
      num="${j}"
  else
      num="0${j}"
  fi

  echo "Measuring sample [$num of 5]"

  /usr/local/nginx/sbin/getHar.sh https://sample-$num

  j=$((j + 1))
done

# Disable tc
echo $PW | sudo tc qdisc del dev lo root

# Quit NGINX
echo $PW | sudo /usr/local/nginx/sbin/nginx -s stop

# Extraxt and insert average loadTime in /usr/local/nginx/sbin/extractor/results.xlsx
node ./main.js $2 $3 $4 $5

echo "Finished"
