---
title: "Replace NETSH TRACE START with PowerShell"
date: "2015-08-10"
categories: 
  - "netsh"
tags: 
  - "powershell"
---

Recently as part of studying for my MCSA I have been using Message Analyzer to look at Kerberos exchanges (among other things). Yes, I really know how to party! I usually did this by starting the trace on the KDC (DC) using the good old command:

### The NETSH Way

```cmd
NETSH TRACE START CAPTURE=yes TRACEFILE=e:\mytrace.etl
NETSH TRACE STOP
```

### The PowerShell Way

```powershell
# NETSH TRACE START CAPTURE=yes TRACEFILE=e:\mytrace.etl
New-NetEventSession               -Name "Capture" -CaptureMode SaveToFile -LocalFilePath "e:\mytrace.etl"
Add-NetEventPacketCaptureProvider -SessionName "Capture" -Level 4 -CaptureType Physical
Start-NetEventSession             -Name "Capture"
```

To stop the trace:

```powershell
# NETSH TRACE STOP
Stop-NetEventSession   -Name "Capture"
Remove-NetEventSession -Name "Capture"
```

Unfortunately this is a bit more verbose than the NETSH equivalent. It is also a bit of a pity the CmdLets aren't written so the output of one can be piped to the next. But we can't have everything.

### More Features

```powershell
Add-NetEventPacketCaptureProvider `
    -SessionName "Capture" `
    -Level 4 `
    -CaptureType Physical `
    -EtherType 0x0800 `
    -IPAddresses 192.168.178.3 `
    -IpProtocols 6,17
```

Will cause the trace to capture only IPv4 traffic to/from 192.168.178.3 for TCP and UDP.

### Remote Capture via RPC

Looking at the documentation for the **New-EventSession** cmdlet, it seems that it is possible to have the trace output sent to a remote host via RPC and then captured directly by Network Analyzer. I haven't been able to get this to work as yet. Figuring out how this works and getting it going is going to be my next project (between studying for the next exam).
