---
title: "A Minor Irritation with VHDs and Dynamic Disks"
date: 2015-07-14
description: "A minor irritation with VHDs and Dynamic Disks in PowerShell."
tags:
  - "diskpart"
  - "dynamic-disks"
  - "powershell"
  - "vhd"
isArchived: true
---

As part of my recent studies (and because I'm a bit OCD) I've been writing some notes on **how to perform** various DISKPART commands in **PowerShell**. You might also need to do this if you're converting old DISKPART scripts into **PowerShell** for automation purposes.

In most cases it’s straight-forward to map DISKPART commands over to **PowerShell**. For example, to use DISKPART to initialise a disk and set the partition format to GPT on disk 6:

```powershell
SELECT DISK=6
ONLINE
CONVERT GPT
```

The PowerShell equivalent would be:

```powershell
Set-Disk      -Number 6 -IsOffline $false
Initialize-Disk -Number 6 -PartitionStyle GPT
```

### The Problems

However, I ran into two situations where PowerShell can’t currently replace DISKPART:

1. **Dynamic disks** can’t be created using **PowerShell**. Therefore spanned, striped, mirrored or parity volumes must still be created with DISKPART. (If you’re on Windows Server 2012/Windows 8 or later, consider using **Storage Spaces** instead.)
1. The **PowerShell** cmdlets to create or mount **Virtual Hard Disk** files (VHD/VHDx) are unavailable if Hyper-V is not installed.  

   ![VHD cmdlets without Hyper-V](/assets/images/screenshots/ss_vhdcmdleterror_hypervrolemissing.png)

   This is a little annoying because the **Hyper-V** role can’t always be installed—e.g. inside a guest VM. While it’s unusual to work with VHD/VHDx files inside a guest, the rise of cloud-hosted dev machines means you might hit this limitation.

That’s it for tonight!
