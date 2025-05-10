---
title: "Get DSC Configuration from a Remote Host using an SSL Connection"
date: "2015-04-23"
categories: 
  - "desired-state-configuration"
  - "dsc"
tags: 
  - "powershell"
---

I've spent the last day or so working on a module to help with managing DSC Pull Servers and other functions to help making DSC a little bit easier to get up and running. This module isn't quite finished yet, but I thought I'd share a quick code snippet that I've been using a lot to get the DSC configuration from a remote machine when credentials and special port details are required.

Normally, if you want to pull the DSC configuration for a remote computer that won't require credentials or SSL WSMan then you can just execute:

```powershell
Get-DSCConfiguration -CimSession 'DSCSVR01'
```

This cmdlet just pulls the DSC configuration from the remote host using any existing credentials and using HTTP instead of HTTPS.

But if you want to use any alternative connection information – such as forcing the use of SSL WSMan – you need to add some CIM options:

```powershell
$cimOption  = New-CimSessionOption -UseSsl
$cimSession = New-CimSession -ComputerName 'DSCSVR01' -Credential (Get-Credential) -SessionOption $cimOption

Get-DSCConfiguration -CimSession $cimSession
Remove-CimSession    -CimSession $cimSession
```

That is about all I've got for today. Hope this helps someone.
