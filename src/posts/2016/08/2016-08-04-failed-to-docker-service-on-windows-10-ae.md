---
title: "Failed to Start Docker Service on Windows 10 AE"
date: 2016-08-04
description: "A quick article about a problem I encountered when trying to start the Docker Service on Windows 10 Anniversary Edition."
tags:
  - "docker"
  - "windows-10"
image: "/assets/images/blog/fi_brokencontainers.jpg"
isArchived: true
---

So, pretty much the first thing I did when the Windows 10 Anniversary Edition was installed onto my primary development machine was to installer the **Windows Container Service** and Docker on it.

I used the [Windows Containers on Windows 10 Quick start guide](https://msdn.microsoft.com/en-us/virtualization/windowscontainers/quick_start/quick_start_windows_10) to perform the installation. This is the same method I'd been using on my secondary development machine (running Insider Preview builds) since it was first available in build 14372.

Note: The Windows Containers on Windows 10 Quick Start guide doesn't mention the Anniversary Edition specifically, but the method still works.

Unfortunately though, this time it didn't work. When I attempted to start the Docker Service I received the error:

start-service : Failed to start service 'Docker Engine (docker)'.

![ss_docker_startserviceerror](/assets/images/screenshots/ss_docker_startserviceerror.png)

So, after a bit of digging around I found the following error in the **Windows Event Log** in the **Application** logs:

![ss_docker_startserviceerror_eventlog](/assets/images/screenshots/ss_docker_startserviceerror_eventlog.png)

Basically what this was telling me was that the Docker Daemon couldn't create the new virtual network adapter that it needed - because it already existed. So a quick run of **Get-NetAdapter** and I found that the docker adapter "vEthernet (HNS Internal)" already existed:

![ss_docker_startserviceerror_eventlog](/assets/images/screenshots/ss_docker_startserviceerror_eventlog.png)

So what I needed to do was **uninstall** this adapter so that the **Docker Service** could recreate it. I'm not actually aware of a **command line** method of doing (except for using [DevCon](https://chocolatey.org/packages/devcon.portable)) so I had to resort to using **Device Manager**:

![ss_docker_startservice_uninstalldevice](/assets/images/screenshots/ss_docker_startservice_uninstalldevice.png)

You'll need to use the output of the **Get-NetAdapter** to find he right adapter **uninstall**. Once it has been uninstalled you should be able to start the service again:

![ss_docker_startservice_dockerstarts](/assets/images/screenshots/ss_docker_startservice_dockerstarts.png)

This time the service should start successfully. A quick call to **docker ps** shows that the container service is indeed working. So now I can get onto the process pulling down the **base container images**.

Hopefully if anyone else runs into this problem in Windows 10 AE this will help them resolve it.
