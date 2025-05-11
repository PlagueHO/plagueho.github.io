---
title: "Stop, Start or Restart all Web Apps in Azure using PowerShell"
date: 2017-10-07
description: "Here is a short (and sometimes handy) single line of PowerShell code that can be used to restart all the Azure Web Apps in a subscription."
tags:
  - "azure"
  - "powershell"
  - "webapp"
coverImage: "/assets/images/screenshots/ss_azurecloudshell_restartallwebapps.png"
---

Here is a short (and sometimes handy) single line of PowerShell code that can be used to **restart** all the Azure Web Apps in a subscription:

```powershell
(Get-AzureRmWebApp).GetEnumerator() | Restart-AzureRmWebApp
```

![ss_azurecloudshell_restartallwebapps](/assets/images/screenshots/ss_azurecloudshell_restartallwebapps.png)

> [!NOTE]
> Use this with care if you're working with production systems because this \_will\_ restart these Web Apps without confirming first.

This would be a handy snippet to be able to run in the [Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/overview). It could also be adjusted to perform different actions on other types of resources.

To **stop** all Web Apps in a subscription use:

```powershell
(Get-AzureRmWebApp).GetEnumerator() | Stop-AzureRmWebApp
```

To **start** them all again:

```powershell
(Get-AzureRmWebApp).GetEnumerator() | Start-AzureRmWebApp
```

The key part of this command is the **GetEnumerator()** method because most Azure Cmdlets don't return an array of individual objects into the pipeline like typical PowerShell cmdlets. Instead returning a **System.Collections.Generic.List** object, which requires a slight adjustment to the code. This procedure can be used for most Azure Cmdlets to allow the results to be iterated through.

![ss_azurecloudshell_systemcollections](/assets/images/screenshots/ss_azurecloudshell_systemcollections.png)

Thanks for reading.
