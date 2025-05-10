---
title: "DSC Tools- Hopefully Making DSC Easier"
date: "2015-05-02"
categories: 
  - "desired-state-configuration"
  - "dsctools"
tags: 
  - "powershell"
coverImage: "fi_dsctools.jpg"
---

### Introduction

Desired State Configuration (DSC) is definitely one of the coolest features of WMF 4.0. This article however is not about what DSC is or how to implement it - there are already many great introductions to DSC out there. If you're new to DSC I'd suggest you take a look at the great free e-book from PowerShell.org: [The DSC Book](https://www.penflip.com/powershellorg/the-dsc-book "The DSC Book").

I've been working with DSC for several months now in my lab environments and I really love it. But it can be a little bit tricky to set up, with lots of steps and things to remember (or forget in my case). It is very easy to miss a step and spend many hours trying to figure out what went wrong - I know this from experience.

I'm certain in the future that Microsoft and/or other tool providers will provide easier methods of implementing DSC, but at the moment it is still a fairly manual process. There are products like Chef (see [Chef for Windows](https://www.chef.io/solutions/windows/ "Chef for Windows")) that are going to use DSC to provide configuration of Windows operating systems (and perhaps non-Windows as well), but as of writing this these tools aren't yet available.

So, after about the 20th time of setting up DSC, I figured that it might be an idea to write some simple tools that could make my life a little bit easier. With that in mind I created a PowerShell module (supporting WMF 4.0 and above) that provides some helper functions and configurations that make setting up DSC Pull Servers and configuring Local Configuration Manager (LCM) on the nodes slightly less painful.

### The Module

With all of the above in mind I set about creating a module that would combine all of these steps into simple PS cmdlets that could be used without having to remember exactly how to do things such as creating an LCM configuration file for a Pull Server or something like that. This in theory would leave more time for the really fun part about DSC: creating node configuration files and resources.

For example, to set up a DSC Pull Server (in HTTP mode) there are several steps required:

1. Download and Install the DSC Resources your configurations will use to the PS modules folder.
2. Publish the DSC Resources to a folder in your Pull Server and create checksum files for them.
3. Create a DSC Configuration file for your Pull Server(s).
4. Run the DSC Configuration file for your Pull Server(s) into to create MOF files.
5. Push the DSC Configuration MOF files to the LCM on the Pull Servers.

These steps are easy to understand and perform, but if you don't do them often you will quickly forget exactly how to do it. I found myself referring back to long sets of instructions (found many places online) every time I did it.

To perform the above steps using the **DSCTools** module simply requires the following cmdlets to be executed on the computer that will become the DSC Pull Server.

```powershell
# Download the DSC Resource Kit and install it to the local DSC Pull Server
Install-DSCResourceKit

# Copy all the resources up to the local DSC Pull Server (zipped and with a checksum file)
Publish-DSCPullResources

# Install a DSC Pull Server to the local machine
Enable-DSCPullServer
```

The cmdlets can be executed on a computer other than the Pull Server by providing `-ComputerName` and `-Credential` parameters.

### DSCTool CmdLet Parameters

Like most PS cmdlets, you can also provide additional configuration options to them as well. For example, you might want your DSC Pull Server resources folder to be placed in a different location, in which case you could provide the commands with the PullServerResourcePath parameter: 

```powershell
# Copy the resources to a non-default folder on the Pull Server
Publish-DSCPullResources -PullServerResourcePath e:\DSC\Resources

# Install a DSC Pull Server that uses the same custom folder
Enable-DSCPullServer    -PullServerResourcePath e:\DSC\Resources
```

Most **DSCTools** cmdlets have many other parameters for controlling most aspects of the functions such as the type of Pull Server to install (HTTP, HTTPS or SMB), the location where files should be stored. If these parameters aren't passed then the default values will be used.

### Default DSCTools Module Settings

If you're lazy (like me) and don't want to have to pass the same parameters in to every cmdlet, you can change the default values by overriding script variables once the module has been loaded. For example you might always want your Pull Servers to use a configuration path of _e:\\DSC\\Configuration_. You could pass the _PullServerConfigurationPath_ parameter to each cmdlet that needs it (which could be many), or you could just change the value of the _$Script:DSCTools\_DefaultPullServerConfigurationPath_ variable: 

```powershell
# Change the default location where all Pull-Server cmdlets put configuration files
$Script:DSCTools_DefaultPullServerConfigurationPath = 'e:\DSC\Configuration'

# Now the standard commands pick up that new default
Publish-DSCPullResources
Enable-DSCPullServer
```

### Configuring a Node

Configuring a node to use the Pull Server also used to be a more complicated process (not counting the actual creation of the node configuration file):

1. Copy the configuration MOF file to the Pull Server.
2. Generate a checksum file for the configuration.
3. Configure the LCM on the node to pull its configuration from the Pull Server.
4. Trigger the node to immediately pull it's DSC configuration from the Pull Server (rather than wait 30 minutes).

This process can now be performed by just two cmdlets: 

```powershell
# Set up NODE01 to pull from the server MYDSCSERVER
# The MOF file is searched for in $Home\Documents\NODE01.MOF (configurable)
Start-DSCPullMode `
    -ComputerName 'NODE01' `
    -PullServerURL 'http://MYDSCSERVER:8080/PSDSCPullServer.svc'

# Force an immediate configuration pull (optional)
Invoke-DSCCheck -ComputerName NODE01
```

### Configuring Lots of Nodes at Once

Once again, this module is all about laziness. So, why configure one node at a time when you can configure lots of them all at once. Many of the cmdlets in this module support a _Nodes_ parameter, which take an array of hash tables. This array of hash tables will contain the definitions of the nodes that need to be set up or have other procedures performed on them (e.g. invoke a configuration check).

For example, to configure seven different nodes for using a DSC Pull Server (with different configurations even) would require the following code: 

```powershell
$Nodes = @(
    @{ Name='NODE01'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e1'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE01.MOF" },
    @{ Name='NODE02'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e2'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE02.MOF" },
    @{ Name='NODE03'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e3'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE03.MOF" },
    @{ Name='NODE04'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e4'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE04.MOF" },
    @{ Name='NODE05'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e5'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE05.MOF" },
    @{ Name='NODE06'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e6'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE06.MOF" },
    @{ Name='NODE07'; Guid='115929a0-61e2-41fb-a9ad-0cdcd66fc2e7'; RebootIfNeeded=$true; MofFile="$PSScriptRoot\Config\NODE07.MOF" }
)

Start-DSCPullMode -Nodes $Nodes -PullServerURL 'http://MYDSCSERVER:8080/PSDSCPullServer.svc'
Invoke-DSCCheck  -Nodes $Nodes
```

The nodes array could even be populated from a CSV file to make it even easier.

### Where to get It

Once the new [PowerShell Gallery](http://www.powershellgallery.com/) is available (for public consumption) I'll upload the module there. But in the mean time it is available on the Microsoft Script Center here:

[DSCTools on Script Center](https://gallery.technet.microsoft.com/scriptcenter/DSC-Tools-c96e2c53 "DSC Tools on Script Center")

If you want to see some more example files (as well as sample node config files I've used in testing the module) you can check out the GitHub repository for the module:

[DSCTools on GitHub](https://github.com/PlagueHO/Powershell/tree/master/DSCTools "DSCTools on GitHub")

The GitHub repository contains additional files not available in the download from the script center including details examples and test configuration files. It is also contained within a Visual Studio 2013 solution so if you're using VS2013 and the PowerShell VS add-in you can easily load it up.

### Future Versions

Over the next few weeks I am planning to update the module so that some of the functions will create the node configuration MOF files by running the actual configuration PS1 files (provided in a nodes array or as parameters). This will eliminate another step when updating any node configuration files.

After creating this module it occurred to me that there might be an even better way to implement a DSC set up: using a basic DSC system XML configuration file that could define all the pull servers and nodes. This XML file could be passed to a cmdlet that could configure all the applicable servers and nodes from the content. So this is the next long-term goal I have for this module.

If anyone out there finds this module useful and has a request for additional features or finds a (shudder) bug, please let me know!
