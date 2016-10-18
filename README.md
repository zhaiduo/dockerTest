# Dockerfile Test

## How to start server?
> npm install
> npm install suppervisor
> npm run develop (local)
> npm run start (online)

## How to use?

after install `Docker` env, and run:
> docker run -d --restart=always -p 8080:8080 --name docker_node_app_alpine zhaiduo/docker_node_app:alpine

## More Tips

init `docker` env
> eval "$(docker-machine env default)"

check docker sessions
> docker ps -a

delete docker container
> docker rm [CONTAINER ID]

run a container with bash
> docker run -t -i zhaiduo/docker_node_app:alpine /bin/bash

stop/start
> docker stop/start [CONTAINER ID]/[IMAGE]

`docker commit`
> docker commit -m "Added" -a "Docker New" [CONTAINER ID] [IMAGE]

`docker tag`
> docker tag [CONTAINER ID] [IMAGE]
> docker images [IMAGE]

`docker push` to share your image to onlint.

backup
> docker save -o [IMAGEName].tar [IMAGE]
> docker export [CONTAINER ID] > [IMAGEName].tar

restore
> docker load --input [IMAGEName].tar | docker load < [IMAGEName].tar ｜ cat [IMAGEName].tar | docker import - [IMAGE]

`docker load`, but `docker import` will lost history log。

remove image `docker rmi`, and remote container use `docker rm`
> docker rmi [IMAGE]

debug `docker`
> docker start -a -i [CONTAINER ID]

Issue：Repository xxx already being pulled by another client. Waiting.
> docker-machine restart default
> eval "$(docker-machine env default)"

* Attension: before remove image with `docker rm`, do remove all containers of it first.

## Links
More: https://yeasy.gitbooks.io/docker_practice/content/introduction/

## Other Purpose
1. familiar with ES6/Webpack.
2. pros/crons on ES6.
3. diferences between React and Angular2.





