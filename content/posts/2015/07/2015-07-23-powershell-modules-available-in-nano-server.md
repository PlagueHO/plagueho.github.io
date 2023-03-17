---
title: "PowerShell Modules Available in Nano Server"
date: "2015-07-23"
categories: 
  - "windows-server-nano"
tags: 
  - "powershell"
  - "sysprep"
---

I have been spending a bit of time experimenting with loading Nano Server into WDS (using capture images, VHDX files and the like) and while doing this I decided to dig around inside Server Nano to see what is missing. The thing that is missing that makes me grumble the most is that lots of PowerShell modules are missing. This of course is because Server Nano doesn't have the full .NET Framework available, which most PowerShell modules depend.

### What Modules are Included?

This to some degree depends on the packages that are installed, but with the OEM-Drivers, Storage and Guest packages installed the following modules are available:

[![PowerShell Modules in Nano](https://dscottraynsford.files.wordpress.com/2015/07/ss_nano_listofpowershellmodules.png?w=660)](https://dscottraynsford.files.wordpress.com/2015/07/ss_nano_listofpowershellmodules.png)

As the screenshot above shows, there are a lot of useful modules missing. Even within some of the modules, many of the CmdLets are not available.

For example, in the **Microsoft.PowerShell.Management** module on Windows Server 2012 R2, there are _86_ CmdLets available. In Nano Server there are only _38:_

[![List of CmdLets in Management Module in TP2](https://dscottraynsford.files.wordpress.com/2015/07/ss_nano_listofmanagmentcmdlets.png?w=660)](https://dscottraynsford.files.wordpress.com/2015/07/ss_nano_listofmanagmentcmdlets.png)

Obviously, this is only Tech Preview 2, and so will likely change, but it certainly might be the case that some PowerShell scripts won't work on Nano Server and will need to be re-written.

### SysPrep is Missing

One other element that is missing from Nano Server is the SYSPREP tool. The folder _c:\\windows\\system32\\sysprep_ is there, but it is empty. So _sysprepping_ a Nano Server at the moment doesn't seem to be possible.
