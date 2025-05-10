---
title: "Get the BIOS GUID of a Hyper-V VM"
date: "2015-11-29"
categories:
  - "hyper-v"
tags:
  - "powershell"
---

I've just spent the last few hours looking into how I can get the BIOS GUID from a Hyper-V VM from inside the Host OS. I needed this so I could use it to pre-stage devices in Windows Deployment Services. I could have used the MAC address of course, but I decided I wanted to use the **BIOS GUID** instead.

So after a fair bit of hunting all I could turn up was an older [VBS script](http://blogs.technet.com/b/m2/archive/2008/07/04/how-to-get-the-bios-guid-from-a-hyper-v-vm.aspx). I decided this wasn't ideal and so went about investigating how I might do this in PowerShell (this is a PowerShell blog mainly after all). Well after a few minutes I came up with this (rather long) command:

{{< gist PlagueHO df990e4da91f81f0123b >}}

It uses WMI/CIM, but does seem to work nicely (don't forget to set the name of the VM):

![ss_ps_getbiosguid](/images/ss_ps_getbiosguid.png)

Good night!
