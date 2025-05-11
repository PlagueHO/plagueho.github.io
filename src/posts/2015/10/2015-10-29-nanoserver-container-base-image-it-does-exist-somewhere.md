---
title: "NanoServer Container Base Image - It does Exist...Somewhere!"
date: 2015-10-29
description: "A really interesting video from Microsoft was just released with Mark Russinovich (CTO of Azure if you don't already know) demonstrating Windows Server Containers."
categories:
  - "containers"
  - "windows-server-nano"
---

A really interesting video from Microsoft was just released with Mark Russinovich (CTO of Azure if you don't already know) [demonstrating Windows Server Containers](https://youtu.be/YoA_MMlGPRc). What is really interesting about this demo is that he is demonstrating containers using a **Windows NanoServer Base Image:**

[![Nano Server Containers Base Image - it does exist.](/assets/images/screenshots/ss_video_nanoservercontainers.png)](/assets/images/screenshots/ss_video_nanoservercontainers.png)  
Nano Server Containers Base Image - it does exist.

If you've read any of my previous posts [here](https://dscottraynsford.wordpress.com/2015/08/26/how-to-use-containers-on-windows-nano-server/) and [here](https://dscottraynsford.wordpress.com/2015/08/27/docker-and-containers-on-nano-server-continued/) you'll know I spent quite some time looking at this and trying to get it going with TP3. I deduced it was not possible yet without the Windows **NanoServer Base Image for containers** - which had not been provided by Microsoft.

Other eagle-eyed viewers will also note that he appears to be running a _Nano Server container_ on a _Full Server container host_, which I didn't actually think was possible. From what I originally understood about containers, you could only instantiate a container using a base container image matching the version of the OS the container host used. For example, you **cannot** instantiate a _Server Core container_ on a _NanoServer container host_—I confirmed this was the case in TP3. But perhaps I misunderstood, or perhaps containers can be instantiated on "up" version container hosts but not "down" version.

> [!NOTE]
> Actually, on further examination he is **remoting** into a different server that is acting as a _Container Host_ (10.205.158.127). So I can't assume that this remote host is a Full Server—it could well be a NanoServer. So the above paragraph isn't relevant.

I also notice that he demos **Hyper-V Containers**, which as far as I am aware aren't working on TP3. So this would indicate a more recent build than TP3.

So perhaps we'll see this image being made available in the Windows Server 2016 TP4 release?
