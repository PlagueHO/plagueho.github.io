---
title: "Force WSUS to Synchronize Now from PowerShell"
date: 2015-07-22
description: "A quick PowerShell command to force WSUS to synchronise now."
tags: 
  - "powershell"
  - "windows-server-update-services"
---

After passing my MS 70.410 exam I had a little bit of free time on my hands, so I thought I'd clean up my WSUS servers and prepare them for Windows 10 and VS 2015. So I thought I'd force myself to do the whole thing via PowerShell. The problem is that the **UpdateServices** PowerShell module doesn't have cmdlets for some things I wanted to do – **force a synchronization** was among them.  
So I needed to use the Microsoft.UpdateServices.NET components to perform these functions.

### Useful Commands

To force a WSUS server to synchronise now:

```powershell
(Get-WsusServer).GetSubscription().StartSynchronization()
```

To get the result of the last synchronisation:

```powershell
(Get-WsusServer).GetSubscription().GetLastSynchronizationInfo()
```

Pretty simple! I'm sure additional functions will crop up and I'll try to post any useful ones here as well.
