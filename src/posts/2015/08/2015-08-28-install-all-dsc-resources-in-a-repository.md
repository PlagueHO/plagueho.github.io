---
title: "Install all DSC Resources in a Repository"
date: 2015-08-28
description: "A quick tip on how to install all DSC resources in a repository."
tags: 
  - "dsc"
  - "powershell"
---

Something quick for Friday morning! Are you feeling enthusiastic about DSC? Do you want to **update** or **install** _every DSC resource_ in a repository onto your computer?

Try this (only on PowerShell 5.0 computers - what do you mean you're not using PowerShell 5.0?!):

```powershell
Find-DscResource |
    Select-Object -ExpandProperty ModuleName -Unique |
    ForEach-Object { Install-Module -Name $_ -Force }
```

This downloads and installs (or updates, if you have older versions) every DSC resource in **all** PowerShell repositories registered on your computer. It can take a while.

If you want to limit the action to a specific repository, do this:

```powershell
$RepoName = 'PSGallery'

Find-DscResource -Repository $RepoName |
    Select-Object -ExpandProperty ModuleName -Unique |
    ForEach-Object { Install-Module -Name $_ -Repository $RepoName -Force }
```

**Important:** only install DSC resources from repositories you trust. Mark trusted repositories so you don’t have to confirm each module installation:

```powershell
Set-PSRepository -Name 'PSGallery' -InstallationPolicy Trusted
```
