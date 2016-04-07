docker stop $(docker ps --filter "ancestor=cpanel" -q)
docker rm $(docker ps -q -f status=exited)
tmux kill-session -t cpanel
docker rm cpanel
tmux new-session -s cpanel -d "docker run -it -p 8000:3000 --link mongodb:mongo --name cpanel cpanel"
sudo service apache2 restart
