---
title: "Install Windows Admin Center (WAC) using DSC"
date: "2018-07-06"
categories:
  - "dsc"
  - "windows-admin-center"
tags:
  - "azure-dsc"
coverImage: "ss_wacdsc_overview.png"
---

[Windows Admin Center (WAC)](https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/understand/windows-admin-center) is a locally deployed, browser-based app for managing servers, clusters, hyper-converged infrastructure, and Windows 10 PCs. It was previously known as **Project Honolulu**.

![ss_wacdsc_overview](/images/ss_wacdsc_overview.png)

WAC really shines when being used to manage headless Windows Servers (e.g. Windows Server Core). The [benefits of deploying Windows Server Core](https://cloudblogs.microsoft.com/windowsserver/2018/07/05/server-core-and-server-with-desktop-which-one-is-best-for-you/) are huge, but it can be a bit daunting to system administrators that have only used the Windows GUI experience to manage servers.

It is pretty easy to install WAC, but if you want to install it with PowerShell DSC, then here is a config for you to use:

\[gist\]e8120e1cc01b447d084322eb2ad14c95\[/gist\]

The config is parameterized and supports specifying the port for the WAC to listen on  and using either a _self-signed certificate_ or a _local machine certificate_ in the by specifying a thumbprint.

To apply the DSC using a self-signed certificate and on the default port of 6516, run the following in an Administrator PowerShell console:

\[gist\]24e893d429e9aa83f00c2021afaab6ef\[/gist\]

![ss_wacdsc_defaultport](/images/ss_wacdsc_defaultport.png)

You can run this on a Windows Server Core machine by logging in and typing **powershell** to start a PowerShell console, then entering the commands above.

To apply the DSC configuration specifying a certificate with a thumbprint from the local machine store and on Port 4000, run these commands instead:

\[gist\]3f4dc6d70e9fa9e294c4a1c691fe7aad\[/gist\]

![ss_wacdsc_installwiththumbprint](/images/ss_wacdsc_installwiththumbprint.png)

This DSC configuration can also be used on Virtual Machines deployed to Azure, using either the [Azure DSC Extension Handler](https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/dsc-overview) or a [Azure Automation DSC Pull Server](https://docs.microsoft.com/en-us/azure/automation/automation-dsc-overview).

Easy as all that. Now you can use the awesome WAC GUI and still run headless while also taking advantage of the benefits that DSC brings.

