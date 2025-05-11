---
title: "Detach from a Docker Container Without Stopping It"
date: 2015-08-28
description: "A quick tip on how to detach from a Docker container without stopping it."
tags:
  - "powershell"
  - "containers"
  - "docker"
isArchived: true
---

Saturday-morning Docker fun times (still only on Windows Server Core) – here’s something I found out that might be useful. It is documented in the official [Docker docs](https://docs.docker.com/articles/basics/) but not in the [Microsoft container docs](https://msdn.microsoft.com/en-us/virtualization/windowscontainers/quick_start/manage_docker).

Once you have attached to a Docker container via a CMD console, typing **exit** detaches from the container *and* **stops** it. That’s usually *not* what I want. To **detach** from the container *without* stopping it, press **Ctrl + P** followed by **Ctrl + Q**.

[![The container is still running after being detached.](/assets/images/screenshots/ss_docker_detatchedbutrunningcontainer.png)](/assets/images/screenshots/ss_docker_detatchedbutrunningcontainer.png)  
*The container is still running after being detached.*

> [!NOTE]
> This only applies to **Docker containers** that you connected to with `docker attach` or `docker run`. **Windows Server Containers** that you entered with `Enter-PSSession` can be exited with the standard **Exit** command.

Well, that’s enough for a Saturday morning!
