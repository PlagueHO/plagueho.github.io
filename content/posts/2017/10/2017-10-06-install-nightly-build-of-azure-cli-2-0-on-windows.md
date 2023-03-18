---
title: "Install Nightly Build of Azure CLI 2.0 on Windows"
date: "2017-10-06"
tags:
  - "azure"
  - "azure-cli-2-0"
  - "powershell"
coverImage: "ss_azurecli_installnightlybuild.png"
---

The [Azure PowerShell cmdlets](https://docs.microsoft.com/en-us/powershell/azure/install-azurerm-ps?view=azurermps-4.4.0) are really first class if you're wanting to manage Azure with PowerShell. However, they don't always support the very latest Azure components and features. For example, at the time of writing this there is no Azure PowerShell module for managing [Azure Container Instances](https://azure.microsoft.com/en-us/services/container-instances/).

The solution to this is to install the **Nightly Build** of [Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). However, on Windows it is not entirely clear the easiest way to do this. So, in this post I'll provide a PowerShell script that will:

1. Install Python 3.x using [Chocolatey](https://chocolatey.org/)
2. Use PIP (Python package manager) to install the latest nightly build packages
3. Update the Environment Path variable so that you can use Azure CLI 2.0.

_**Note:** If you have the stable build of Azure CLI 2.0 installed using the MSI then you'll need to configure your Environment Path variable to find the Az command that you'd like to use by default. I personally removed the stable build of Azure CLI 2.0 to make it easier._

## Performing the Install

Make sure you've got [Chocolatey installed](https://chocolatey.org/install). If you aren't sure what Chocolatey is, it is a package management system for Windows - not unlike Apt-Get or Yum for Linux. It is free and awesome. In this process we'll use Chocolatey to install Python for us. If you haven't got Chocolatey installed, see [this page](https://chocolatey.org/install) for instructions.

Next, download and run this PowerShell script in a PowerShell Administrator Console:

{{< gist PlagueHO cf9ed6c3fcadb4db6152ef1e1f18f791 >}}

You could save the content of this script into a PS1 file and then execute it like this:

![ss_azurecli_installnightlybuild](/images/ss_azurecli_installnightlybuild.png)

It will then download and install Python, then use PIP to install the current nightly build packages. After a few minutes the installation will complete:

![ss_azurecli_installnightlybuildcompete](/images/ss_azurecli_installnightlybuildcompete.png)

You can then run:

Az Login

To get started.

If you're a bit new to Azure CLI 2.0, then another great way is to use Azure CLI Interactive:

Az Interactive

![ss_azurecli_interactive](/images/ss_azurecli_interactive.png)

If you need to update to a newer nightly build, just run the script again and it will update your packages.

Easy as that! Now you can experiment with all the latest automation features in Azure without needing to wait for a new version of Azure CLI 2.0 or for latest Azure PowerShell cmdlets.

## Edge Builds

If you want to install even more "bleeding edge" builds (built straight off the master branch on every merge to master) then you can make a small adjustment to the script above:

On [line 34](cf9ed6c3fcadb4db6152ef1e1f18f791#file-add-azureclinightlybuildwithpython-ps1-L34) change the URL of the feed from:

https://azureclinightly.blob.core.windows.net/packages

To:

https://azurecliprod.blob.core.windows.net/edge

Thanks for reading!

