---
title: "Installing Windows Server 2012 R2 Core - Additional Tools and Scripts"
date: 2014-12-03
description: "Installing Windows Server 2012 R2 Core - Additional Tools and Scripts"
tags:
  - "powershell"
  - "windows-server-core"
  - "windows-server-2012"
isArchived: true
---

Although Windows Server Core is a great way of ending up with a slim and trim diet server, it can be a little bit tricky when first getting started configuring it. During my experiments running Server Core VMs, I found that there were a few tools either built into Server Core or available separately that can help get over this configuration "hump."

## Built-in Tools

### SConfig.exe

`SConfig.exe` is a built-in command-line tool (with a simple command-line GUI) that allows you to perform some simple configuration tasks on your core installation.

![SConfig.exe](/assets/images/screenshots/ss_sconfig1.png)

Some of the functions include:

1. Renaming the computer
1. Joining a domain or workgroup
1. Enabling remote management (Win-RM)
1. Enabling remote desktop
1. Installing Windows updates
1. Configuring network settings
1. Changing system date/time
1. Shutting down/rebooting the server

## Other Tools

When installing a new copy of one of the Windows Server Core versions, it's quite useful to install several additional tools that will help manage the server from a _command prompt_ and/or _PowerShell_ console.

### Corefig for Windows Server 2012 Core and Hyper-V Server 2012

[Corefig](https://corefig.codeplex.com/ "Corefig for Windows Server 2012 Core and Hyper-V Server 2012") allows you to configure some of the main settings of a Windows Server Core installation as well as installing updates and Windows features and roles.

![Corefig PowerShell Application](/assets/images/screenshots/ss_corefig1.png)

### Windows Update PowerShell Module

The [Windows Update PowerShell module](https://gallery.technet.microsoft.com/scriptcenter/2d191bcd-3308-4edd-9de2-88dff796b0bc "Windows Update PowerShell Module") allows you to install Windows updates from a PowerShell command line by executing (after installing the module onto the server):

```powershell
Get-WUInstall
```

### Remote Server Administration Tools PowerShell Module

The Remote Server Administration Tools PowerShell module is available as an installable feature on Windows Server Core edition. It needs to be first installed by executing the following command at a PowerShell prompt:

```powershell
Add-WindowsFeature -Name 'RSAT-AD-PowerShell' -IncludeAllSubFeature
```

### PowerShell Community Extensions

The [PowerShell Community Extensions](https://pscx.codeplex.com/ "PowerShell Community Extensions") project provides various useful PowerShell cmdlets. I always install this onto the server and copy the entire PSCX modules folder:

```plaintext
C:\Program Files (x86)\PowerShell Community Extensions\Pscx3\
```

...into the system modules folder:

```plaintext
C:\Program Files\WindowsPowerShell\Modules
```

This makes the PSCX module available via the `Import-Module` command in PowerShell.
