---
title: "Disk Cleanup and the joys of Features-on-demand"
date: "2015-01-28"
categories:
  - "dism"
  - "features-on-demand"
  - "windows-server-2012"
tags:
  - "disk-cleanup"
  - "powershell"
  - "windows-server-core"
---

_Features-on-demand_ - it's a great new "feature" - when it works. However, the rest of the time it is a real headache.

A couple of months ago I decided I wanted to trim down the size of my Windows Server 2012 R2 VM's. _Disk Cleanup_ (cleanmgr.exe) is one tool that I've often found really useful to have on a server install, especially when preparing OS VM images to ensure the install is as lean and clean as possible.

However, by default the tool isn't installed on Windows Server 2012. To get access to _Disk Cleanup_ on a server OS you need to install the _Desktop Experience_ feature:

[![Install Desktop Experience using Add Roles and Features Wizard](/images/ss_installfeature_desktopexperience.png?w=646)](/images/ss_installfeature_desktopexperience.png)
Install Desktop Experience using Add Roles and Features Wizard

Because I had used _features-on-demand_ to remove any disabled packages from the system I received a message telling me I might need to specify an alternate location for the source files:

[![Specify an Alternate Source path](/images/ss_installfeature_specifyanalternatesourcepath.png?w=646)](/images/ss_installfeature_specifyanalternatesourcepath.png)
Specify an Alternate Source path

Anyone who has used _features-on-demand_ should be familiar with this:

[![Desktop Experience Feature-on-demand removed](/images/ss_windowsfeature_desktopexperienceremoved.png?w=646)](/images/ss_windowsfeature_desktopexperienceremoved.png)
Desktop Experience Feature-on-demand removed

Because I haven't got a GPO restricting my servers from downloading updates and packages from _Windows Update_ I thought I wouldn't have a problem and didn't need to specify a source.

I was wrong:

[![Failed to install the Desktop Exprience](/images/ss_installfeature_failed.png?w=646)](/images/ss_installfeature_failed.png) Failed to install the Desktop Experience

That is a bit odd - the server has access to _Windows Update_ - it had downloaded updates earlier that day. Other **removed** _features-on-demand_ features had been installed on this server without an issue, downloading the source files directly from _Windows Update_. So I was a little puzzled as to why this was different.

No problem, I thought! All that needs to be done is specify a _source_. In case this is useful, the following TechNet article covers the different ways of specifying a _source_ when installing features that have been removed:

[Configure Features on Demand in Windows Server](http://technet.microsoft.com/en-us/library/jj127275.aspx "Configure Features on Demand in Windows Server")

There are several different sources that can be provided to the _Add Roles and Features Wizard_:

- Specify a WIM file (and index) containing the windows installation files for the OS version that was installed on the server. This is usually a file called _install.wim_ that can be found in the _Sources_ folder of the Windows Server2012R2 installation media.

    [![Install Feature using a WIM source](/images/ss_installfeature_alternatesourcewim.png?w=646)](/images/ss_installfeature_alternatesourcewim.png) Install Feature using a WIM source
- Specify the windows folder of a working OS install containing the files for this feature. This is usually done by mapping a drive to a share or by mountingaVHD/VHDx file as a drive to the OS.

    [![Install Feature using a shared Windows Folder on a machine with the Desktop Experience feature installed](/images/ss_installfeature_alternatesourceshare.png?w=646)](/images/ss_installfeature_alternatesourceshare.png) Install Feature using a shared Windows Folder on a machine with the Desktop Experience feature installed

I tried both of the above methods but neither of them seemed to work for the _Desktop Experience_ feature. The same error occurred every time:

Install-Windowsfeature: The request to add or remove features on the specified server failed.
Installation of one or more roles, role services, or features failed.
The source files could not be downloaded.
Use the "source" option to specify the location of the files that are required to restore the feature. For more
information on specifying a source location, see http://go.microsoft.com/fwlink/?LinkId=243077. Error: 0x800f0906

I also tried installing the feature using _PowerShell,_ using no alternative source, using a WIM source and using a Windows folder source:

```powershell
Install-WindowsFeature -name Desktop-Experience -IncludeAllSubfeature -Restart -Source z:
```

But each time I received the same error message:

[![Install Feature with PowerShell and specifing a valid source - failure.](/images/ss_installfeature_powershellfailed.png?w=646)](/images/ss_installfeature_powershellfailed.png) Install Feature with PowerShell and specifying a valid source - failure.

At this point I had all but given up. Luckily I didn't. I thought I'd give it one last try - but this time instead of using commands from the _PowerShell DISM module_ I'd use _DISM.EXE_ directly:

```cmd
DISM /online /enable-feature /featurename:DesktopExperience /all /source:z:\\
```

Success! DISM worked!

[![DISM for the WIN! Back of the net!](/images/ss_installfeature_dismsuccess.png?w=646)](/images/ss_installfeature_dismsuccess.png)
DISM for the WIN! Back of the net!

This screenshot and the one above of the _PowerShell_ _install-windowsfeature_ failing to install the feature are from the same machine with the same source mapped.

Z: drive here was mapped to a share of the _c:\\windows_ folder of a server that has the _Desktop Experience_ feature correctly installed.

It looks like _DISM_ may operate in a slightly different way to _PowerShell DISM Module_ and the _Add Roles and Features Wizard_ when it comes to installing features.

**So, if _Add Roles and Features Wizard_ and _PowerShell Install-WindowsFeature_ fail, try DISM - it might work!**

### Additional Notes

I have also run into the same problem when installing the _AD DS_ feature on a different server - so I don't think this is specific to the machine or the feature. It has also occurred on machines that I want to convert from a _core_ install to a _gui_ install.

I have tried installing the feature on a clean install of the OS and it works fine - but as soon as all the latest windows hotfixes for the OS are installed from _Windows Update_ the feature can no longer be installed (if it has been removed).

From my investigation, many other people have experienced this problem with varying degrees of success in solving it. Some have said that patching the WIM file with all the latest hotfixes worked for them - but it didn't for me (but it did inspire me to write a _PowerShell_ module to ease the WIM patch process - more on this in another post). I was certainly in the "tearing my hair out" group until I randomly tried this.

Also, I did try _DISM_ without specifying a source as well, and it failed with the same error code as the _PowerShell_ did:

[![Install Feature using DISM fails with no Source specified.](/images/ss_installfeature_dismfailure2.png?w=660)](/images/ss_installfeature_dismfailure2.png)
Install Feature using DISM fails with no Source specified.

At first I actually thought the soution was using _DISM_ with the _/LimitAccess_ switch to prevent _DISM_ from using the internet to download the packages, but after further tests it doesn't seem to make any difference - _DISM_ works with and without this switch. The equivelent to the _/LimitAccess_ switch also doesn't appear to be available in the _PowerShell Install-WindowsFeature_ cmdlet.

