---
title: "Install Windows Admin Center (WAC) using DSC"
date: 2018-07-06
description: "Install Windows Admin Center (WAC) using DSC"
tags:
  - "azure-dsc"
  - "dsc"
  - "windows-admin-center"
image: "/assets/images/blog/ss_wacdsc_overview.png"
---

[Windows Admin Center (WAC)](https://docs.microsoft.com/en-us/windows-server/manage/windows-admin-center/understand/windows-admin-center) is a locally deployed, browser-based app for managing servers, clusters, hyper-converged infrastructure, and Windows 10 PCs. It was previously known as **Project Honolulu**.

![ss_wacdsc_overview](/assets/images/blog/ss_wacdsc_overview.png)

WAC really shines when being used to manage headless Windows Servers (e.g., Windows Server Core). The [benefits of deploying Windows Server Core](https://cloudblogs.microsoft.com/windowsserver/2018/07/05/server-core-and-server-with-desktop-which-one-is-best-for-you/) are huge, but it can be a bit daunting to system administrators that have only used the Windows GUI experience to manage servers.

It is pretty easy to install WAC, but if you want to install it with PowerShell DSC, then here is a configuration for you to use:

```powershell
configuration WindowsAdminCenter {
    param (
        [System.String]
        $WacProductId = '{7019BE31-3389-46FB-A077-B813D53C1266}',
        
        [System.String]
        $WacDownloadPath = 'https://download.microsoft.com/download/1/0/5/1059800B-F375-451C-B37E-758FFC7C8C8B/WindowsAdminCenter1809.5.msi',

        [System.Int16]
        $Port = 6516,
        
        [System.String]
        $Thumbprint
    )

    Import-DscResource -ModuleName PSDscResources
    
    if ([System.String]::IsNullOrEmpty($Thumbprint)) {
        $wacInstallArguments = "/qn /l*v c:\windows\temp\windowsadmincenter.msiinstall.log SME_PORT=$Port SSL_CERTIFICATE_OPTION=generate"
    } else {
        $wacInstallArguments = "/qn /l*v c:\windows\temp\windowsadmincenter.msiinstall.log SME_PORT=$Port SME_THUMBPRINT=$Thumbprint"
    }
    
    Node localhost {
        MsiPackage InstallWindowsAdminCenter {
            ProductId = $WacProductId
            Path      = $WacDownloadPath
            Arguments = $wacInstallArguments
            Ensure    = 'Present'
        }
    }
}
```

The configuration is parameterized and supports specifying the port for WAC to listen on and using either a _self-signed certificate_ or a _local machine certificate_ by specifying a thumbprint.

To apply the DSC using a self-signed certificate and on the default port of 6516, run the following in an Administrator PowerShell console:

```powershell
Invoke-WebRequest -Uri 'https://gist.githubusercontent.com/PlagueHO/e8120e1cc01b447d084322eb2ad14c95/raw/2aff9e1a8d94cdb6f8a7409874a3bdbfcf234f8e/WindowsAdminCenterDscConfiguration.ps1' -OutFile 'WindowsAdminCenterDscConfiguration.ps1'
Install-Module -Name PSDscResources
. .\WindowsAdminCenterDscConfiguration.ps1
WindowsAdminCenter
Start-DscConfiguration -Path .\WindowsAdminCenter\ -ComputerName localhost -Wait -Verbose
```

![ss_wacdsc_defaultport](/assets/images/blog/ss_wacdsc_defaultport.png)

You can run this on a Windows Server Core machine by logging in and typing **powershell** to start a PowerShell console, then entering the commands above.

To apply the DSC configuration specifying a certificate with a thumbprint from the local machine store and on Port 4000, run these commands instead:

```powershell
Invoke-WebRequest -Uri 'https://gist.githubusercontent.com/PlagueHO/e8120e1cc01b447d084322eb2ad14c95/raw/2aff9e1a8d94cdb6f8a7409874a3bdbfcf234f8e/WindowsAdminCenterDscConfiguration.ps1' -OutFile 'WindowsAdminCenterDscConfiguration.ps1'
Install-Module -Name PSDscResources
. .\WindowsAdminCenterDscConfiguration.ps1
WindowsAdminCenter -Port 4000 -Thumbprint 'fddfec2150b2a1c0d1166debffdbed1d55798485'
Start-DscConfiguration -Path .\WindowsAdminCenter\ -ComputerName localhost -Wait -Verbose
```

![ss_wacdsc_installwiththumbprint](/assets/images/blog/ss_wacdsc_installwiththumbprint.png)

This DSC configuration can also be used on Virtual Machines deployed to Azure, using either the [Azure DSC Extension Handler](https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/dsc-overview) or an [Azure Automation DSC Pull Server](https://docs.microsoft.com/en-us/azure/automation/automation-dsc-overview).

Easy as all that. Now you can use the awesome WAC GUI and still run headless while also taking advantage of the benefits that DSC brings.
