---
title: "Installing Windows Server 2012 R2 Core - Additional Tools and Scripts"
date: "2014-12-03"
categories:
  - "windows-server-2012"
tags:
  - "powershell"
  - "windows-server-core"
---

Although Windows Server Core is a great way of ending up with a slim and trim diet server, it can be a little bit tricky when first getting started configuring it. During my experiments running Server Core VM's I found that there were a few tools either built into server core or available separately that can help get over this configuration "hump".

### Built-in Tools

1. #### SConfig.exe

    SConfig.exe is a built in command line tool (with a simple command line GUI) that allows you to perform some simple configuration tasks on your core installation.

    [![SConfig.exe](/images/ss_sconfig1.png?w=300)](/images/ss_sconfig1.png)

    Some of the functions include:
    1. Renaming the computer
    2. Joining a domain or workgroup
    3. Enabling remote management (Win-RM)
    4. Enabling remote desktop
    5. Installing windows updates
    6. Configure network settings
    7. Change system date/time
    8. Shutdown/reboot server

### Other Tools

When installing a new copy of one of the Windows Server Core versions it's quite useful to install several additional tools that will help manage the server from a _command prompt_ and/or _PowerShell_ console.

1. #### Corefig for Windows Server 2012 Core and Hyper-V Server 2012

    [Corefig](https://corefig.codeplex.com/ "Corefig for Windows Server 2012 Core and Hyper-V Server 2012") allows you to configure some of the main settings of a Windows Server Core installation as well as installing updates and windows features and roles.

    [![Corefig PowerShell Application](/images/ss_corefig1.png?w=300)](/images/ss_corefig1.png)
2. #### Windows Update PowerShell Module

    The [Windows Update PowerShell module](https://gallery.technet.microsoft.com/scriptcenter/2d191bcd-3308-4edd-9de2-88dff796b0bc "Windows Update PowerShell Module") allows you to install windows updates from a PowerShell command line by executing (after installing the module onto the server):

    Get-WUInstall

3. #### Remote Server Administration Tools PowerShell module

    The Remote Server Administration Tools PowerShell module is available as an installable feature on Windows Server Core edition. It needs to be first installed by executing the following command at a PowerShell prompt:

    Add-WindowsFeature -Name 'RSAT-AD-PowerShell' -IncludeAllSubFeature

4. #### PowerShell Community Extensions

    The [PowerShell Community Extensions](https://pscx.codeplex.com/ "PowerShell Community Extensions") project provides various useful PowerShell cmdlets. I always install this onto the server and copy the entire PSCX modules folder:

    c:\\Program Files (x86)\\PowerShell Community Extensions\\Pscx3\\

    folder into the system modules folder:

    c:\\Program Files\\WindowsPowerShell\\Modules

    This makes the PSCX module available by the import-module command in PowerShell.

