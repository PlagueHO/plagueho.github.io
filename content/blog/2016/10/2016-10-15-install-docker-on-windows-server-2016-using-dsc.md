---
title: "Install Docker on Windows Server 2016 using DSC"
date: "2016-10-15"
categories:
  - "containers"
  - "docker"
  - "dsc"
  - "windows-server-2016"
coverImage: "ss_dockerdsc_installing.png"
---

Windows Server 2016 is now GA and it contains some pretty exciting stuff. Chief among them for me is support for containers by way of [Docker](http://www.docker.com/). So, one of the first things I did was start installing Windows Server 2016 VM's (Server Core and Nano Server naturally) and installing Docker on them so I could begin experimenting with Docker Swarms and other cool stuff.

_**Edit: If you're looking for a DSC configuration for setting up Docker on a Windows 10 Anniversary Edition machine, see the Windows 10 AE section below.**_

At first I started using the [standard manual instructions](https://blog.docker.com/2016/09/build-your-first-docker-windows-server-container) provided by Docker, but this doesn't really suit any kind of automation or infrastructure as code methodology. This of course was a good job for [PowerShell Desired State Configuration (DSC)](https://msdn.microsoft.com/en-us/powershell/dsc/overview).

So, what I did was put together a basic DSC config that I could load into a DSC Pull Server and build out lots of Docker nodes quickly and easily. This worked really nicely for me to build out lots of Windows Server 2016 Container hosts in very short order:

![ss_dockerdsc_installing](/images/ss_dockerdsc_installing.png)

If you don't have a DSC Pull server or you just want a simple script that you can use to quickly configure a Windows Server 2016 (Core or Core with GUI only) then read on.

**_Note: This script and process is really just an example of how you can configure Docker Container hosts with DSC. In a real production environment you would probably want to use a DSC Pull Server._**

# Get it Done

_**Edit: After a suggestion from Michael Friis ([@friism](https://twitter.com/friism)) I have uploaded the script to the [PowerShell Gallery](https://www.powershellgallery.com/packages/Install-DockerOnWS2016UsingDSC) and provided a simplified method of installation. The steps could be simplified even further into a single line, but I've kept them separate to show the process.**_

### Using PowerShell Gallery

On a **Windows Server 2016 Server Core** or **Windows Server 2016 Server Core with GUI** server:

1. Log on as a user with **Local Administrator** privileges.
2. Start an **Administrator PowerShell** console - if you're using Server Core just enter **PowerShell** at the command prompt:![ss_dockerdsc_console](/images/ss_dockerdsc_console.png)
3. Install the **Install-DockerOnWS2016UsingDSC.ps1** script from the PowerShell Gallery using this command: 
```powershell
Install-Script -Name Install-DockerOnWs2016UsingDSC
``` _You may be asked to confirm installation of these modules, answer yes to any confirmations._ ![ss_dockerdsc_consolegetscript](/images/ss_dockerdsc_consolegetscript.png)
4. Run the **Install-DockerOnWS2016UsingDSC.ps1** script using: 
```powershell
Install-DockerOnWs2016UsingDSC.ps1
``` ![ss_dockerdsc_consolerunscriptfromgallery](/images/ss_dockerdsc_consolerunscriptfromgallery.png)

The script will run and reboot the server once. Not long after the reboot the Docker service will start up and you can get working with containers:

![ss_dockerdsc_consoledockerdetails](/images/ss_dockerdsc_consoledockerdetails.png)

You're now ready to start working with Containers.

### The Older Method (without PowerShell Gallery)

On a **Windows Server 2016 Server Core** or **Windows Server 2016 Server Core with GUI** server:

1. Log on as a user with **Local Administrator** privileges.
2. Start an **Administrator PowerShell** console - if you're using Server Core just enter **PowerShell** at the command prompt:![ss_dockerdsc_console](/images/ss_dockerdsc_console.png)
3. **Install the DSC Resources** required for the DSC configuration by executing these commands: 
```powershell
Install-Module -Name xPSDesiredStateConfiguration
Install-Module -Name xPendingReboot
``` _You may be asked to confirm installation of these modules, answer yes to any confirmations._ ![ss_dockerdsc_consoleinstallresources](/images/ss_dockerdsc_consoleinstallresources.png)
4. **Download the Docker installation DSC script** by executing this command: 
```powershell
Invoke-WebRequest -Uri 'https://gist.githubusercontent.com/PlagueHO/d9595cae1788f436b97bd4c90d50d72e/raw/1146baa2b1e0c8b3869004074b4c97bf71ce9c3c/Install-DockerOnWS2016ByDSC.ps1' -OutFile 'Install-DockerOnWS2016ByDSC.ps1'
``` ![ss_dockerdsc_consoledownloadscript](/images/ss_dockerdsc_consoledownloadscript.png)
5. **Run the Docker installation DSC script** by executing this command: 
```powershell
.\Install-DockerOnWS2016ByDSC.ps1
``` ![ss_dockerdsc_consolerunscript](/images/ss_dockerdsc_consolerunscript.png)

The script will run and reboot the server once. Not long after the reboot the Docker service will start up and you can get working with containers:

![ss_dockerdsc_consoledockerdetails](/images/ss_dockerdsc_consoledockerdetails.png)

You're now ready to start working with Containers.

# What the Script Does

In case you're interested in what the script actually contains, here are the components:

1. **Configuration ContainerHostDsc -** the [DSC configuration](https://msdn.microsoft.com/en-us/powershell/dsc/configurations) that configures the node as a Docker Container host.
2. **Configuration ConfigureLCM** \- the [LCM meta configuration](https://msdn.microsoft.com/en-us/powershell/dsc/metaconfig) that sets **Push Mode**, allows the LCM to reboot the node if required and configures **ApplyAndAutoCorrect** mode.
3. **ConfigData** - a [ConfigData object](https://msdn.microsoft.com/en-us/powershell/dsc/configdata) that contains the list of node names to apply this DSC Configuration to - in this case LocalHost.
4. **ConfigureLCM** - the call to the **Configuration ConfigureLCM** to [compile the LCM meta configuration MOF file](https://msdn.microsoft.com/en-us/powershell/dsc/metaconfig).
5. **Set-DscLocalConfigurationManager** - this applies the compiled LCM meta configuration MOF file to LocalHost to configure the LCM.
6. **ContainerHostDsc** - the call to the **Configuration ContainerHostDsc** to compile the DSC MOF file.
7. **Start-DSCConfiguration** - this command starts the LCM applying the DSC MOF file produces by the **ContainerHostDsc**.

The complete script can be found [here](d9595cae1788f436b97bd4c90d50d72e). Feel free to use this code in anyway that makes sense to you.

# What About Windows 10 AE?

If you're looking for a DSC configuration that does the same thing for _Windows 10 Anniversary edition_, **Ben Gelens** ([@bgelens](https://twitter.com/bgelens)) has written an awesome DSC config that will do the trick. Check it out [here](https://gist.github.com/bgelens/152fdc075b6ffcf639da775958076c6a).

 

Happy containering!


