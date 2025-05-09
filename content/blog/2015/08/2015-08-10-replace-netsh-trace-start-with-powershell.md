---
title: "Replace NETSH TRACE START with PowerShell"
date: "2015-08-10"
categories: 
  - "netsh"
tags: 
  - "powershell"
---

Recently as part of studying for my MCSA I have been using Message Analyzer to look at Kerberos exchanges (among other things). Yes, I really know how to party! I usually did this by starting the trace on the KDC (DC) using the good old command:

NETSH TRACE START CAPTURE=yes TRACEFILE=e:\\mytrace.etl

Followed by this command to stop the trace:

NETSH TRACE STOP

This works very well. I also read this great [article](http://blogs.technet.com/b/askpfeplat/archive/2015/08/10/leveraging-windows-native-functionality-to-capture-network-traces-remotely.aspx) on TechNet on streamlining remote traces. But being a bit OCD I wondered if there is a PowerShell equivalent to these commands. Well it turns out there is!

### The PowerShell Way

The equivalent CmdLets to starting a trace are:

\[sourcecode language="powershell"\] # NETSH TRACE START CAPTURE=yes TRACEFILE=e:\\mytrace.etl New-NetEventSession -Name "Capture" -CaptureMode SaveToFile -LocalFilePath "e:\\mytrace.etl" Add-NetEventPacketCaptureProvider -SessionName "Capture" -Level 4 -CaptureType Physical Start-NetEventSession -Name "Capture" \[/sourcecode\]

And to stop the trace:

\[sourcecode language="powershell"\] # netsh trace stop Stop-NetEventSession -Name "Capture" Remove-NetEventSession -Name "Capture" \[/sourcecode\]

Unfortunately this is a bit more verbose than the NETSH equivalent. It is also a bit of a pity the CmdLets aren't written so the output of one can be piped to the next. But we can't have everything.

### More Features

The **Add-NetEventPackageCaptureProvider** cmdlet also provides additional parameters to restrict what will be captured - for example:

\[sourcecode language="powershell"\] Add-NetEventPacketCaptureProvider -SessionName "Capture" -Level 4 -CaptureType Physical -EtherType 0x0800 -IPAddresses 192.168.178.3 -IpProtocols 6,17 \[/sourcecode\]

Will cause the trace to capture only IPv4 traffic to/from 192.168.178.3 for TCP and UDP.

### Remote Capture via RPC

Looking at the documentation for the **New-EventSession** cmdlet, it seems that it is possible to have the trace output sent to a remote host via RPC and then captured directly by Network Analyzer. I haven't been able to get this to work as yet. Figuring out how this works and getting it going is going to be my next project (between studying for the next exam).

