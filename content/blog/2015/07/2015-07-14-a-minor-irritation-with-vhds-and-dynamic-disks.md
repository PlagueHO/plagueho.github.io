---
title: "A Minor Irritation with VHDs and Dynamic Disks"
date: "2015-07-14"
tags:
  - "diskpart"
  - "dynamic-disks"
  - "powershell"
  - "vhd"
---

As part of my recent studies (and because I'm a bit OCD) I've been writing some notes on what how to perform various DISKPART commands in **PowerShell**. You might also need to do this if you're converting old DISKPART scripts into **PowerShell** (for whatever reason).

In most cases it is straight forward to map DISKPART commands over to **PowerShell**. For example, to use DISKPART to initialize and set the partition format to GPT on disk 6 in a machine:

SELECT DISK=6
ONLINE
CONVERT GPT

Whereas in **PowerShell** the equivalent would be:

\[sourcecode language="powershell"\] Set-Disk -Number 6 -IsOffline $false Initialize-Disk -Number 6 -PartitionStyle GPT \[/sourcecode\]

### The Problems

However, I ran into two situations where PowerShell can't be used when doing mapping:

1. **Dynamic** disks can't be created using **PowerShell**. Therefore spanned, striped, mirrored or parity volumes can't be created without using DISKPART. However, **Storage Spaces** could be used instead if you're using Windows Server 2012/Windows 8 and above.
2. The **PowerShell** cmdlets to create and mount **Virtual Hard Disk** files (VHD/VHDx) can't be used if Hyper-V is not installed:[![VHD cmdlets without Hyper-V](/images/ss_vhdcmdleterror_hypervrolemissing.png?w=660)](/images/ss_vhdcmdleterror_hypervrolemissing.png) This is a little bit annoying because the **Hyper-V** role can't always be installed. For example, it can't be installed on a guest VM. Of course it is probably a bit unusual to be working with VHD/VHDx files within a guest VM (you're more likely to be working with them on the host), but with the amount of stuff moving to the cloud this might be a problem that you run into.

That's it for tonight!

