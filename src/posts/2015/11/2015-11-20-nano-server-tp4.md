---
title: "Nano Server TP4"
date: 2015-11-20
description: "A quick article about Nano Server TP4."
tags: 
  - "windows-server-2016"
  - "windows-server-nano"
  - "powershell"
---

Just a quick one for Friday. After downloading the new Windows Server 2016 TP4 ISO, I quickly fired up my **New-NanoServerVHD** script to see how it went. Unfortunately, I ran straight into a bug in the **Convert-WindowsImage** script. The bug in this script only occurs when the WIM file being converted only contains a single image—which as of TP4 includes the NanoServer.wim.

If you try and run the **New-NanoServerVHD** script using the _unfixed_ version of the **Convert-WindowsImage** script and TP4, you'll run into the following error message:

```text
ERROR : The variable cannot be validated because the value $null is not a valid value for the Edition variable
```

So, after reporting the error to the original script creator, I went ahead and fixed the problem myself and uploaded a working version to GitHub (until it has been fixed in the official version). You can download my fixed version from [here](https://raw.githubusercontent.com/PlagueHO/Powershell/master/New-NanoServerVHD/Convert-WindowsImage.ps1).

## Installing Nano Server TP4

After fixing the **bug** in the `Convert-WindowsImage.ps1` file, here are some updated instructions on using this script to quickly create a new Nano Server TP4 VHD or VHDx.

[Create a New Nano Server VHD](https://gallery.technet.microsoft.com/scriptcenter/Create-a-New-Nano-Server-61f674f1 "Create a New Nano Server VHD")

It is fairly straightforward to install and use:

1. Create a **Working Folder** on your computer. In this example, I used `C:\Nano`.
1. Download the `_New-NanoServerVHD.ps1_` to the **Working Folder**.
1. Download the `_Convert-WindowsImage.ps1_` ([download here](https://raw.githubusercontent.com/PlagueHO/Powershell/master/New-NanoServerVHD/Convert-WindowsImage.ps1)) to the **Working Folder**.
1. Download the Windows Server 2016 Technical Preview ISO ([download here](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-technical-preview)) to the **Working Folder**.
1. Open an Administrative PowerShell window.
1. Change directory to the **Working Folder** (`cd C:\Nano`).
1. Execute the following command (customizing the parameters to your needs):

```powershell
.\New-NanoServerVHD.ps1 `
    -ServerISO 'C:\Nano\10586.0.151029-1700.TH2_RELEASE_SERVER_OEMRET_X64FRE_EN-US.ISO' `
    -DestVHD C:\Nano\NanoServer01.vhdx `
    -VHDFormat VHDX `
    -ComputerName NANOTEST01 `
    -AdministratorPassword 'P@ssword!1' `
    -Packages 'Containers','OEM-Drivers','Guest','IIS','DNS' `
    -IPAddress '192.168.1.65'
```

## Available Packages in TP4

There are a bunch of new packages that are now available in TP4 for integrating into your Nano Server builds. I'm not quite sure of the exact purpose of some of them, but I've listed them here:

- **Compute**: Hyper-V Server
- **OEM-Drivers**: Standard OEM Drivers
- **Storage**: Storage Server
- **FailoverCluster**: Failover Cluster Server
- **ReverseForwarders**: ReverseForwarders to allow some older App Servers to run
- **Guest**: Hyper-V Guest Tools
- **Containers**: Support for Hyper-V and Windows containers
- **Defender**: Windows Defender
- **DCB**: Unsure
- **DNS**: DNS Server
- **DSC**: PowerShell Desired State Configuration Support
- **IIS**: Internet Information Server (Web Server)
- **NPDS**: Unsure
- **SCVMM**: System Center VMM
- **SCVMM-Compute**: System Center VMM Compute

Over and out.
