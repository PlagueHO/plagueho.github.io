---
title: "Nano Server Technical Preview 3 Available Now!"
date: 2015-08-20
description: "A look at the new features in Nano Server Technical Preview 3."
tags:
  - "windows-server-2016"
  - "windows-server-nano"
  - "powershell"
isArchived: true
---

Naturally, right as I need to be focusing on rebuilding my lab environment (using PowerShell scripts only of course), Microsoft goes and releases Windows Server 2016 Technical Preview 3, which contains lots of cool things like [containers](http://weblogs.asp.net/scottgu/announcing-windows-server-2016-containers-preview). It also meant a new version of the awesome **Nano Server**.

But this time, Microsoft has released an installer script called **new-nanoserverimage.ps1** on the ISO in the **Nano Server** folder. This means that my script **new-nanoservervhd.ps1** isn't really needed any more. The official Microsoft one contains few more features that the one I wrote and being official should really be used instead of my old one. But as I have a whole lot of scripts to create Nano VM's already that use my script I thought I'd update [my script](https://gallery.technet.microsoft.com/scriptcenter/Create-a-New-Nano-Server-61f674f1) anyway (and upload it to [script center](https://gallery.technet.microsoft.com/scriptcenter/Create-a-New-Nano-Server-61f674f1)).

So after updating my script I built some new VM's containing the new packages **containers** and **defender**. I noticed something different straight away - the Nano Server now has a minimal head display called **Emergency Management Console**:

[![Nano Server Emergency Management Console](/assets/images/screenshots/ss_nanoserver_tp3.png)](/assets/images/screenshots/ss_nanoserver_tp3.png)
Nano Server Emergency Management Console

This allows you to easily see some basic information **about** the running Nano Server on a monitor (or, more likely, a VM console). But you do first need to log in to the Nano Server before you can review this information:

[![Nano Server Authenticate](/assets/images/screenshots/ss_nanoserver_authenticate.png)](/assets/images/screenshots/ss_nanoserver_authenticate.png)
Nano Server Authenticate

You can’t actually do much once inside the **Emergency Management Console** except reboot and shut down the server. But this does mean that you no longer need to create a start-up task that shows the IP address and other details of the Nano Server on screen manually. I’ve left it in my script for now, but it could probably be removed once I’m sure it isn’t necessary.

Back to the lab scripting!
