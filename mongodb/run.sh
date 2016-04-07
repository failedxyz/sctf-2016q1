docker stop mongodb
docker rm mongodb
docker volume rm $(docker volume ls -qf dangling=true)
docker run -d -p 27017:27017 --name mongodb mongo mongod --smallfiles
