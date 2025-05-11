---
title: "Get the BIOS GUID of a Hyper-V VM"
date: 2015-11-29
description: "How to get the BIOS GUID of a Hyper-V VM from the Host OS using PowerShell."
tags:
  - "hyper-v"
  - "powershell"
isArchived: true
---

I've just spent the last few hours looking into how I can get the BIOS GUID from a Hyper-V VM from inside the Host OS. I needed this so I could use it to pre-stage devices in Windows Deployment Services. I could have used the MAC address of course, but I decided I wanted to use the **BIOS GUID** instead.

So after a fair bit of hunting all I could turn up was an older [VBS script](http://blogs.technet.com/b/m2/archive/2008/07/04/how-to-get-the-bios-guid-from-a-hyper-v-vm.aspx). I decided this wasn't ideal and so went about investigating how I might do this in PowerShell (this is a PowerShell blog mainly after all). Well after a few minutes I came up with this (rather long) command:

```powershell
$VMName = 'My VM'
(Get-CimInstance -Namespace Root\Virtualization\V2 -ClassName Msvm_VirtualSystemSettingData -Filter "ElementName = '$VMName'").BiosGUID
```

It uses WMI/CIM, but does seem to work nicely (don't forget to set the name of the VM):

![ss_ps_getbiosguid](/assets/images/screenshots/ss_ps_getbiosguid.png)

Good night!
