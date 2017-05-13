# CRM
Server

CRM platform for small/medium organizations. This project runs on nodejs, postgres and redis as background services where as device specific app acts as user interface.

sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000