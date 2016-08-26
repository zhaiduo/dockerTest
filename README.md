#Dockerfile Test

##如何启动？
> npm install
> npm install suppervisor
> ./doMigrate.sh
> npm run develp (本地)
> npm run start (线上)

##How to use

安装好 `Docker` 环境后，直接运行我们构建好的容器即可：
> docker run -d --restart=always -p 8080:8080 --name docker_node_app_alpine zhaiduo/docker_node_app:alpine

##More Tips

初始化 `docker` 环境
> eval "$(docker-machine env default)"

查看所有容器
> docker ps -a

查看删除已有容器
> docker rm [CONTAINER ID]

创建一个容器，让其中运行 `bash` 应用。
> docker run -t -i zhaiduo/docker_node_app:alpine /bin/bash

停止/开始运行
> docker stop/start [CONTAINER ID]/[IMAGE]

使用 `docker commit` 命令来提交更新后的副本。
> docker commit -m "Added" -a "Docker New" [CONTAINER ID] [IMAGE]

`docker tag` 命令来修改镜像的标签。
> docker tag [CONTAINER ID] [IMAGE]
> docker images [IMAGE]

`docker push` 命令，把自己创建的镜像上传到仓库中来共享。例如，用户在 `Docker Hub` 上完成注册后，可以推送自己的镜像到仓库中。

如果要导出镜像到本地文件
> docker save -o [IMAGEName].tar [IMAGE]
> docker export [CONTAINER ID] > [IMAGEName].tar

载入镜像
> docker load --input [IMAGEName].tar | docker load < [IMAGEName].tar ｜ cat [IMAGEName].tar | docker import - [IMAGE]

`docker load` 来导入镜像存储文件到本地镜像库，也可以使用 `docker import` 来导入一个[容器快照]到本地镜像库。
这两者的区别在于[容器快照]文件将丢弃所有的历史记录和元数据信息

移除本地的镜像，可以使用 `docker rmi` 命令。注意 `docker rm` 命令是移除容器
> docker rmi [IMAGE]

调试 `docker` 启动错误
> docker start -a -i [CONTAINER ID]

问题：Repository xxx already being pulled by another client. Waiting.
> docker-machine restart default
> eval "$(docker-machine env default)"

* 注意：在删除镜像之前要先用 `docker rm` 删掉依赖于这个镜像的所有容器。

##Links
More: https://yeasy.gitbooks.io/docker_practice/content/introduction/






