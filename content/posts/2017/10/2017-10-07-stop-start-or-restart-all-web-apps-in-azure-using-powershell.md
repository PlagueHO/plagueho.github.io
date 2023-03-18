---
title: "Stop, Start or Restart all Web Apps in Azure using PowerShell"
date: "2017-10-07"
tags:
  - "azure"
  - "powershell"
  - "webapp"
coverImage: "ss_azurecloudshell_restartallwebapps.png"
---

Here is a short (and sometimes handy) single line of PowerShell code that can be used to **restart** all the Azure Web Apps in a subscription:

\[gist\]4fd4960521eea680a6ac06f9fe5c7cc8\[/gist\]

![ss_azurecloudshell_restartallwebapps](/images/ss_azurecloudshell_restartallwebapps.png)

_**Note:** Use this with care if you're working with production systems because this \_will\_ restart these Web Apps without confirming first._

This would be a handy snippet to be able to run in the [Azure Cloud Shell](https://docs.microsoft.com/en-us/azure/cloud-shell/overview). It could also be adjusted to perform different actions on other types of resources.

To **stop** all Web Apps in a subscription use:

\[gist\]4ff6e52c79be933c991e6655b6af4adc\[/gist\]

To **start** them all again:

\[gist\]29e93a8b0f0f8b7d050f53f37dc61e6a\[/gist\]

The key part of this command is the **GetEnumerator()** method because most Azure Cmdlets don't return an array of individual objects into the pipeline like typical PowerShell cmdlets. Instead returning a **System.Collections.Generic.List** object, which requires a slight adjustment to the code. This procedure can be used for most Azure Cmdlets to allow the results to be iterated through.

![ss_azurecloudshell_systemcollections](/images/ss_azurecloudshell_systemcollections.png)

Thanks for reading.

