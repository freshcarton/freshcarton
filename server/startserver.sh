#!/bin/sh

filename="./log/server_log_`date "+%y_%m_%d_%H_%M_%S"`.log"
outFilename="./log/server_log_`date "+%y_%m_%d_%H_%M_%S"`.out"
errFilename="./log/server_log_`date "+%y_%m_%d_%H_%M_%S"`.err"

# pid="log/server.pid"

echo `date`": Starting Web server - " `sh whatismyip.sh`


# nohup nodemon bin/www >> $filename  2>&1 &
# echo $! > $pid

<<<<<<< Updated upstream
export FOREVER_ROOT=./

touch $filename
touch $outFilename
touch $errFilename


forever start --minUptime=1000 --spinSleepTime=1000 -a -l $filename -o $outFilename -e $errFilename bin/www
=======
#FOREVER_ROOT=./log
#forever --minUtime=1000 --spinSleepTime=1000 -w --watchIgnore '{\.git,logs,tmp,node_modules}/**' start ./config/forever.prod.json 
>>>>>>> Stashed changes
