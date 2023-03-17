---
title: "Detatch from a Docker Container without Stopping It"
date: "2015-08-28"
categories: 
  - "containers"
  - "docker"
tags: 
  - "powershell"
---

Saturday morning Docker fun times (still only on Windows Server Core) - here is something I found out that might be useful. It is in the [Docker documentation](https://docs.docker.com/articles/basics/) but it is not mentioned in the [Microsoft container documentation](https://msdn.microsoft.com/en-us/virtualization/windowscontainers/quick_start/manage_docker).

Once you have attached to a Docker Container via a CMD console typing **exit** at the console **detatches** from the container _and_ **Stops** it. This is not usually what I want to do. To **detatch** from the container _without_ stopping it press **CTRL+P** followed by **CTRL+Q**.

\[caption id="attachment\_342" align="alignnone" width="660"\][![The container is still running after being detached.](https://dscottraynsford.files.wordpress.com/2015/08/ss_docker_detatchedbutrunningcontainer.png?w=660)](https://dscottraynsford.files.wordpress.com/2015/08/ss_docker_detatchedbutrunningcontainer.png) The container is still running after being detached.\[/caption\]

**Note**: This only applies to **Docker Containers** that have been attached to via **docker attach** or **docker run**. **Windows Server Containers** that have been connected to via **Enter-PSSession** can be exited using the **Exit** command.

Well that is enough for a Saturday morning.
