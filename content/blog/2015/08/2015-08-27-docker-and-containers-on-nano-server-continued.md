---
title: "Docker and Containers on Nano Server Continued"
date: "2015-08-27"
categories:
  - "containers"
  - "windows-server-2016"
  - "windows-server-nano"
tags:
  - "powershell"
coverImage: "ss_nano_containers_firstcontainer.png"
---

This is a continuation of my investigation of how to get Containers and also possibly the Docker engine running on **Windows Server Nano 2016 TP 3**. The initial investigation into this can be found here: [How to use Containers on Windows Nano Server.](https://dscottraynsford.wordpress.com/2015/08/26/how-to-use-containers-on-windows-nano-server/)

This post is mainly documenting the process of manually creating containers on Windows Nano Server 2016 TP3 as well as some additional details about what I have managed to find out. The documentation on **Windows Server Containers** from Microsoft is relatively thin at the moment (not surprising - this is very much in technical preview) and so a lot of the information here is speculation on my part. Still, it might be useful to get an idea of how things eventually will work. But of course a good deal of it could change in the near future. This information is really to help me get my head around the concepts and how it will work, but it might be useful for others.

### Step 1 - Create a Nano Server Virtual Machine

Anyone who has played around with Nano Server should already be very familiar with this step. The only thing to remember is that the following packages must be included in the VHDx:

1. **Guest** - All Nano Server VHDx files running as  VM should have this package. If you're installing Nano Server onto bare metal you won't need this.
2. **Compute** - Includes the Nano Server Hyper-V components. Required because Containers use Hyper-V networking and are a form of Virtualization.
3. **OEM-Drivers** - Not strictly required but I tend to include it anyway.
4. **Containers** - This package provides the core of Windows Server Containers.

If you're unfamiliar with creating a Nano Server VHDx, please see [this](https://dscottraynsford.wordpress.com/2015/05/08/install-windows-server-nano-the-easy-way/) post.

### Step 2 - Configure the Container Host Networking

Any _container_ that needs to be connected to a network (most of them usually) will need to connect to a **Hyper-V Virtual Switch** configured on this **Container Host**. There are two virtual switch types that can be configured for this purpose:

1. **NAT** - This seems to be a new switch type in Windows Server 2016 that causes performs some kind of NAT on the connected adapters.
2. **DHCP** - this is actually just a standard **External** switch with a connection to a physical network adapter on the **Container Host**.

The installation script normally performs one of the above depending on which option you select. However on Nano Server both of these processes fail:

#### NAT

Creating a **NAT** **VM Switch** on Nano Server actually works. But the command to create a NAT Network connection to the VM Switch fails because the **NETNAT** module is not available on Nano Server.

#### DHCP

[![Creating a standard External VM Switch on Nano Server](/images/ss_nano_containers_creatingadhcpswitch.png?w=660)](/images/ss_nano_containers_creatingadhcpswitch.png)

Creating a **DHCP/External VM Switch** on Nano Server just fails with a cryptic error message. The same error occurs when creating a _Private_ or _Internal_ VM Switch, so I expect Hyper-V on Nano Server isn't working so well (or at all). Not much point pursuing this method of networking.

### Step 3 - Install a Base OS Image from a WIM File

Every _container_ you create requires a **Base OS Image**. This **Base OS Image** contains all the _operating system_ files and _registry settings_ for the OS a container uses. **Windows Server Containers** expects to be provided with at least one **Base OS Image** in the form of a **WIM** **file**. You can't create a container without one of these. At this point I am unsure if the **WIM file** that **Windows Server Containers** will use is a customized version of the **WIM file** provided with an OS or if it is standard.

During an installation of **Windows Server Containers** onto a **Windows Server Core** operating system, the process automatically [downloads](http://aka.ms/ContainerOSImage) a WIM file that is used as the **Base OS Image**.

To install a **Base OS Image** from a **WIM** file on the **Container Host**, use:

```powershell
Install-ContainerOSImage -WimPath CoreServer.wim -Verbose
```

![Installing a Base OS Image](/images/ss_nano_containerinstallingos.png?w=660)

This function does several things:

1. Creates a new folder in `C:\ProgramData\Microsoft\Windows\Images` whose name is the *canonical* name of the new **Base OS Image**.  
   ![Contents of the Images folder](/images/ss_nano_container_images_content.png?w=660)
2. Inside that folder a sub-folder called **files** is created and the image is expanded there.  
   ![The contents of an Image files folder](/images/ss_nano_container_image_files.png?w=660)
3. Another sub-folder called **hives** is created which contains the default registry hives for the image.  
   ![The Image registry hives](/images/ss_nano_container_image_hives.png?w=660)
4. Two metadata files are written – **Metadata.json** and **Version.wcx**.  
   ![Image metadata](/images/ss_nano_container_image_metadata.png?w=660)
5. Finally, the image is added to the list of container images available for new containers.  
   ![All Base OS images installed](/images/ss_nano_containers_installedall.png?w=660)

I have tried using **Install.wim** from the ISO, **NanoServer.wim** from the ISO, and the **Core.wim** downloaded via the Core-edition container install script. Note that *Install.wim* on the TP3 ISO still reports **Windows Server 2012 R2 SERVERSTANDARDCORE** (double-checked via the version number inside the image).

The **Test-ContainerImage** cmdlet can be used to identify "problems" with container images:

[![Testing Containers](/images/ss_nano_containers_testcontainers.png?w=660)](/images/ss_nano_containers_testcontainers.png)

None of the container images report any problems which is nice to know.

### Step 4 - Create a Container

This is obviously where things should start to get exciting! The next step is to create a shiny new container using one of our **Base OS Images**. However, if you try and create a new container at this point a cryptic error message will occur:

[![New Container? Nope!](/images/ss_nano_containers_newcontainerfailure.png?w=660)](/images/ss_nano_containers_newcontainerfailure.png)

I don't know what causes this, but if you reboot your Nano Server VM the error goes away and you should be able to successfully create the container:

[![First Container - making progress](/images/ss_nano_containers_firstcontainer.png?w=660)](/images/ss_nano_containers_firstcontainer.png)

Unfortunately only the Base OS image downloaded from Microsoft for Windows Server 2016 Core results in a valid container. It seems that certain customisations are required before an image can be _containerised_.

### Step 5 - Start the Container

I'm not holding my breath here. This is what happens when the container is started:

[![Starting up the Container - nope!](/images/ss_nano_containers_startupfailure.png?w=660)](/images/ss_nano_containers_startupfailure.png)

Looking closely at the text of the error it would appear that there was a mismatch between the **Container Host OS version** and that of the **Base OS version** that the container was using. This is probably because the _Container Host_ is a **Nano Server** and the **Base OS** that was downloaded was for a **Core Server**.

### Next Steps

It would seem at this point we have to wait for Microsoft to provide a **Base OS** file for **Nano Server** and also fix the **Virtual Switch** issues with Nano Server before any further progress can be made experimenting with Containers on Nano Server.

However, it may still be possible to get the Docker Engine working under Nano Server and see if that offers any more information. So that will be what I'll look into next.

Also, it is interesting to dig around into the files that are created when the new container was created:

[![Files Created with a Container](/images/ss_nano_containers_containerfiles.png?w=660)](/images/ss_nano_containers_containerfiles.png)

When a container is created the container files are stored in the **C:\\ProgramData\\Microsoft\\Windows\\Hyper-V\\containers** folder. Unfortunately the files all binary so we aren't able to dig around in them to glean any other information.

Well, that is enough for today.
