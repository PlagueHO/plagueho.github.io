---
title: "Install all DSC Resources in a Repository"
date: "2015-08-28"
categories: 
  - "dsc"
tags: 
  - "powershell"
---

Something quick for Friday morning! Are you feeling enthusiastic about DSC? Do you want to **update** or **install** _every DSC resource_ in a repository onto your computer?

Try this (only on PowerShell 5.0 computers - what do you mean you're not using PowerShell 5.0?):

\[sourcecode language="powershell"\] Find-DscResource | Select-Object -ExpandProperty ModuleName -Unique | % { Install-Module -Name $\_ -Force } \[/sourcecode\]

This will download and install (or update if you've got older versions) of all DSC Resources in all PowerShell Repositories registered on your computer. This can definitely take some time.

If you would like to limit this to only using a specific repository use:

\[sourcecode language="powershell"\] $RepoName = 'PSGallery' Find-DscResource -Repository $RepoName | Select-Object -ExpandProperty ModuleName -Unique | % { Install-Module -Name $\_ -Repository $RepoName -Force } \[/sourcecode\]

**Important Note:** I'd suggest you only install DSC resources from _repositories you trust_. You might therefore want to make sure you've marked those repositories as trusted otherwise you'll need to confirm the installation of each module (which is a little irritating).

To trust a repository:

\[sourcecode language="powershell"\] Set-PSRepository -Name PSGallery -InstallationPolicy Trusted \[/sourcecode\]
