---
title: "Install Nightly Build of Azure CLI 2.0 on Windows"
date: 2017-10-06
description: "Installing the Nightly Build of Azure CLI 2.0 on Windows using PowerShell and Chocolatey."
tags:
  - "azure"
  - "azure-cli-2-0"
  - "powershell"
image: "/assets/images/screenshots/ss_azurecli_installnightlybuild.png"
isArchived: true
---

The [Azure PowerShell cmdlets](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-4.4.0) are really first class if you're wanting to manage Azure with PowerShell. However, they don't always support the very latest Azure components and features. For example, at the time of writing this there is no Azure PowerShell module for managing [Azure Container Instances](https://azure.microsoft.com/en-us/services/container-instances/).

The solution to this is to install the **Nightly Build** of [Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). However, on Windows it is not entirely clear the easiest way to do this. So, in this post I'll provide a PowerShell script that will:

1. Install Python 3.x using [Chocolatey](https://chocolatey.org/)
1. Use PIP (Python package manager) to install the latest nightly build packages
1. Update the Environment Path variable so that you can use Azure CLI 2.0.

> [!NOTE]
> If you have the stable build of Azure CLI 2.0 installed using the MSI then you'll need to configure your Environment Path variable to find the Az command that you'd like to use by default. I personally removed the stable build of Azure CLI 2.0 to make it easier.

## Performing the Install

Make sure you've got [Chocolatey installed](https://chocolatey.org/install). If you aren't sure what Chocolatey is, it is a package management system for Windows - not unlike Apt-Get or Yum for Linux. It is free and awesome. In this process we'll use Chocolatey to install Python for us. If you haven't got Chocolatey installed, see [this page](https://chocolatey.org/install) for instructions.

Next, download and run this PowerShell script in a PowerShell Administrator Console:

```powershell
<#
    .SYNOPSIS
        Install Azure CLI 2.0 Nightly Build on Windows using Chocolatey and PowerShell
#>
if (-not (Get-Command -Name Choco -ErrorAction SilentlyContinue))
{
    Throw 'Chocolatey is not installed. Please install it. See https://chocolatey.org/install for instructions.'
}

Write-Host -Object 'Installing Python 3 with Chocolatey...'
& choco @('install','python3','-y')

Update-SessionEnvironment

$pyhtonScriptsPath = Join-Path -Path $ENV:APPDATA -ChildPath 'Python\Python36\Scripts'
$currentPath = [System.Environment]::GetEnvironmentVariable('Path',[System.EnvironmentVariableTarget]::User) -split ';'
if ($currentPath -notcontains $pyhtonScriptsPath)
{
    Write-Host -Object 'Adding Python Scripts to User Environment Path...'
    $newPath = @()
    $newPath += $currentPath
    $newPath += $pyhtonScriptsPath
    $newPathJoined = $newPath -join ';'
    [System.Environment]::SetEnvironmentVariable('Path',$newPathJoined,[System.EnvironmentVariableTarget]::User)
}

if (-not $currentPath.Contains($pyhtonScriptsPath))
{
    Write-Host -Object 'Adding Python Scripts to Current PowerShell session path...'
    $ENV:Path = "$($ENV:Path);$pyhtonScriptsPath"
}

Write-Host -Object 'Installing nightly build of Az CLI 2.0...'
& pip @('install','--no-cache-dir','--user','--upgrade','--pre','azure-cli','--extra-index-url','https://azureclinightly.blob.core.windows.net/packages')

Write-Host -Object 'Installation of nightly build of Az CLI 2.0 complete. Execute "az" to start.'
```

You could save the content of this script into a PS1 file and then execute it like this:

![ss_azurecli_installnightlybuild](/assets/images/screenshots/ss_azurecli_installnightlybuild.png)

It will then download and install Python, then use PIP to install the current nightly build packages. After a few minutes the installation will complete:

![ss_azurecli_installnightlybuildcompete](/assets/images/screenshots/ss_azurecli_installnightlybuildcompete.png)

You can then run:

```powershell
az login
```

To get started.

If you're a bit new to Azure CLI 2.0, then another great way is to use Azure CLI Interactive:

```powershell
az login interactive
```

![ss_azurecli_interactive](/assets/images/screenshots/ss_azurecli_interactive.png)

If you need to update to a newer nightly build, just run the script again and it will update your packages.

Easy as that! Now you can experiment with all the latest automation features in Azure without needing to wait for a new version of Azure CLI 2.0 or for latest Azure PowerShell cmdlets.

## Edge Builds

If you want to install even more "bleeding edge" builds (built straight off the master branch on every merge to master) then you can make a small adjustment to the script above:

On [line 34](cf9ed6c3fcadb4db6152ef1e1f18f791#file-add-azureclinightlybuildwithpython-ps1-L34) change the URL of the feed from:

https://azureclinightly.blob.core.windows.net/packages

To:

https://azurecliprod.blob.core.windows.net/edge

Thanks for reading!
