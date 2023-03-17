---
title: "Force WSUS to Synchronize Now from PowerShell"
date: "2015-07-22"
categories: 
  - "windows-server-update-services"
tags: 
  - "powershell"
---

After passing my MS 70.410 exam I had a little bit of free time on my hands, so I thought I'd clean up my WSUS servers and prepare them for Windows 10 and VS 2015. So I thought I'd force myself to do the whole thing via PowerShell. The problem is that the **UpdateServices** PowerShell module doesn't have cmdlets for some things I wanted to do -**force a synchronization** was among them. So I needed use the Microsoft.UpdateServices.NET components to perform these functions.

### Useful Commands

To force a WSUS server to synchronize now:

\[sourcecode language="powershell"\] (Get-WsusServer).GetSubscription().StartSynchronization() \[/sourcecode\]

To get the result of the last synchronization:

\[sourcecode language="powershell"\] (Get-WsusServer).GetSubscription().GetLastSynchronizationInfo() \[/sourcecode\]

Pretty simple! I'm sure additional functions will crop up and I'll try to post any useful ones here as well.
