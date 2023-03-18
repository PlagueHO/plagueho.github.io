---
title: "New-NanoServerVHD Updated to support changes in Convert-WindowsImage"
date: "2015-06-19"
---

A new version of **Convert-WindowsImage.ps1** script that me **New-NanoServerVHD.ps1** script uses was released a few days ago. It fixes the issue with running on Windows 10 and Windows Server 2016. However it was also changed in other ways that caused my **New-NanoServerVHD.ps1** script to no longer function.

So I've updated the **New-NanoServerVHD.ps1** script to support the newer **ConvertWindowsImage.ps1** script. I also added support for creating a VHDx (with a GPT partition table format) so that it can be used with Generation 2 VMs.

You can control the format of the VHD that is created by passing in a **VHDFormat** parameter. This parameter defaults to **VHD**. If **VHD** is created it will automatically have a partition format of MBR set. When a VHDx is created it will have a GPT partition format.

Here is an example showing how to create a Nano Server VHDx for a Gen 2 VM:

\[sourcecode language="powershell"\] .\\New-NanoServerVHD.ps1 \` -ServerISO 'c:\\nano\\10074.0.150424-1350.fbl\_impressive\_SERVER\_OEMRET\_X64FRE\_EN-US.ISO' \` -DestVHD c:\\nano\\NanoServer02.vhdx \` -VHDFormat VHDx \` -ComputerName NANOTEST02 \` -AdministratorPassword 'P@ssword!1' \` -Packages 'Storage','OEM-Drivers','Guest' \` -IPAddress '192.168.1.66' \[/sourcecode\]

The updated **New-NanoServerVHD.ps1** script can be downloaded [here](https://gallery.technet.microsoft.com/scriptcenter/Create-a-New-Nano-Server-61f674f1).

