---
title: "How To use Containers on Windows Nano Server"
date: "2015-08-26"
categories:
  - "containers"
  - "docker"
  - "windows-server-nano"
tags:
  - "powershell"
---

**Edit:** I wrote this article when examining **containers** on **Windows Nano Server TP3** - _which wasn't in a working state_. I have not yet had a chance to fully examine **containers** on **Windows Nano Server TP4**, but when I get a spare day hours I will no doubt deep dive into it.

If you're looking for instructions on installing and using **containers** on **Windows Nano Server TP4**, start [here](https://msdn.microsoft.com/en-us/virtualization/windowscontainers/deployment/deployment#nano).

These instructions are more focused on setting up a container host on **Windows Server Core TP4**, but I have managed to get them working on **Windows Nano Server TP4** just fine:

![ss_nano_containerhostworking](/images/ss_nano_containerhostworking.png)

I do plan to document this process over the next week or so.

* * *

 

You'd be forgiven for believing that it was just a simple click of a button (or addition of a package) to get Docker Containers working on a shiny new **Windows Nano Server TP3** install. That is what I thought too. But after careful examination of the available [documentation](https://msdn.microsoft.com/en-us/virtualization/windowscontainers/containers_welcome) I found that there isn't much information on running actually getting containers working on Nano Server. Sure, there is lots of information on running it on a full or core version of WIndows Server TP3, but Nano is lacking. So, because I'm a bit obsessive I decided I'd have a try and adapting the standard installation process.

**Edit:** Initially I had a bit of success, but I've run into some rather stop dead issues that I haven't been able to resolve (see later on in this post).

I have continued the investigation [here](https://dscottraynsford.wordpress.com/2015/08/27/docker-and-containers-on-nano-server-continued/) with a much more in depth look at the issues.

_**tl;dr: Containers on Windows Server Nano 2016 TP3 does not work yet! The Base OS WIM file for Windows Server Nano is required, but has not been provided.**_

### Problems with the Standard Containers Install Script

First up I grabbed a copy of [this script](http://aka.ms/setupcontainers) from Microsoft which is what is used to install containers on a full Windows Server 2016 install. I took a look at it and identified the things that wouldn't work on a Nano Server 2016 install. This is what I found:

1. The script can optionally configure a NAT switch - this requires the **NetNat** PS module which isn't available on Nano.
2. The script will install a VM Switch - therefore the **Compute** package is required to be installed on the Nano Server (the **Compute** package contains the Hyper-V components).
3. The script can download various files from the internet (using the alias **wget**). **Wget** and **Invoke-WebRequest** are not available on Nano Server - so we'll need to download the files to another machine and pre-copy them to the Nano Server.
4. The **Expand-Archive** is used to extract the **NSSM** executable, but this cmdlet is not available on Nano Server either - so we'll need to extract the NSSM.exe on another machine and copy it to the server.

### The Process of Installing a Container Host

The process of actually installing a Container Host in Windows Nano Server is as follows:

1. Create a Nano Server VHDx with the packages **Guest, OEM-Drivers, Compute** and **Containers**.
2. Create a new VM booting from the VHDx - this is our **Container Host**.
3. Upload a **Base OS WIM file** to the **Container Host** containing that will be used to create new containers.
4. Upload **Docker.exe** to c:\\windows\\system32\\ on the **Container Host**.
5. Upload **NSSM.exe** to c:\\windows\\system32\\ on the **Container Host** - this is used to create and run the **Docker Service**.
6. Run the installation script on the **Container Host** - this will install the networking components and configure the **Docker** service as well as create the _container OS image_.
7. Create a **Container**!

In theory the **Container Host** is now ready to go!

### What is Required to build a Nano Server Container Host

A bit of experience with PowerShell is a good help here!

So, to create a Nano Server Container Host you'll need a few things:

1. A machine that can run Generation 2 Hyper-V machines (Gen 1 will probably work but I'm using Gen 2) - this will host your Nano Server. This machine must also be running **PowerShell 5.0** (I'm using some PS5.0 only cmdlets)!
2. A copy of the Windows Server 2016 TP 3 ISO from [here.](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-technical-preview)
3. A working folder (I used D:\\Temp) where you'll put all the scripts and other files etc.
4. The scripts (I'll provide them all in a zip file), but they are:
    1. **New-ContainerHostNano.ps1** - this will do everything and is the only script you'll run.
    2. **Install-ContainerHostNano.ps1** - this is the script that gets automatically run on the **Container Host**. It is a version of the Microsoft one from [here](http://aka.ms/setupcontainers) that I have adjusted to work with Nano Server.
    3. **New-NanoServerVHD.ps1** - this is a script I wrote a while back to create Nano Server VHDx files (see this [post](https://dscottraynsford.wordpress.com/2015/05/08/install-windows-server-nano-the-easy-way/) for more details).
    4. **Convert-WindowsImage.ps1** \- this script is required by **New-NanoServerVHD.ps1** and is available on [Microsoft Script Center](https://gallery.technet.microsoft.com/scriptcenter/Convert-WindowsImageps1-0fe23a8f).

### How Can I use all This?

I haven't really finished implementing or testing these scripts and I am encountering a problem creating the VM Switch on the Nano Server, but if you're interested you can get a hold of the scripts in my [GitHub repository](https://github.com/PlagueHO/Powershell/tree/master/Install-ContainerHostNano/Install-ContainerHostNano).

To use them:

1. Create a **working folder** (I used d:\\temp).
2. Download the four PS1 scripts from the [GitHub repository](https://github.com/PlagueHO/Powershell/tree/master/Install-ContainerHostNano/Install-ContainerHostNano) to the **working folder**.
3. Download the Windows Server 2016 TP3 ISO from [here](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-technical-preview) and put it in the **working folder**.
4. Download the Base OS Container Image from [here](http://aka.ms/ContainerOSImage) (3.5GB download) and put it in the **working folder**.
5. Edit the **New-ContainerHostNano.ps1** file in the working folder and customize the variables at the top to suit your paths and such - fairly self explanatory.
6. In an **Administrative PowerShell** run the **New-ContainerHostNano.ps1** file.

Please note: This is a **work in progress**. There are definitely some bugs in it:

1. An error is occurring when trying to create the VM Switch in DHCP mode or NAT mode.
2. If using NAT mode the NAT module isn't included in Nano Server so although the VM switch gets created the NAT Network adapter can't be created.
3. NSSM isn't creating the Docker Service - which may just be an issue with running the PowerShell installation script remotely.

_None of the above will stop containers being created though._ The containers might not be able to communicate with the world via networking and the Docker management engine might not work, but in theory the containers should still work (at least that is my understanding).

### The BIG Problem

Any container that you create requires a WIM file that contains the **container base OS image** that container will use. Microsoft has so far only provided a base WIM file for **WIndows Server 2016 Core** installations - they _haven't_ provided a **container base OS Image** for **Windows Server 2016 Nano** yet. You can download the Core one from [here](http://aka.ms/ContainerOSImage) (3.5GB download).

If you try to use the NanoServer.WIM file from the Windows Server 2016 ISO as the container base OS image you can't even create the container at all.

I did try putting the Core WIM file downloaded above onto the Nano Server. I could then create a container OK, but an error would occur starting it up:

[![Nope - can't use the Core WIM with a Nano Server Container Host!](/images/ss_nano_containerfromcore.png?w=660)](/images/ss_nano_containerfromcore.png)
Nope - can't use the Core WIM with a Nano Server Container Host!

**Update 2015-10-29:** There is a new video available online from Microsoft of Mark Russinovich (Azure CTO) doing a container demonstration using a Nano Server. It clearly shows that the **NanoServer Base Container Image** does exist. So perhaps we'll see this in the **TP4** release.

The video can be seen [here](https://youtu.be/YoA_MMlGPRc).

Feel free to let me know if you can solve any of these issues! Any help is appreciated. I'll continue to work on this and post any additional results.

