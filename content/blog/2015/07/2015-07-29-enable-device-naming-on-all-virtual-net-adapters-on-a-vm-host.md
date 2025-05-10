---
title: "Enable Device Naming on all Virtual Net Adapters on a VM Host"
date: "2015-07-29"
categories: 
  - "hyper-v"
tags: 
  - "powershell"
---

After a couple of bumps upgrading my development laptop to Windows 10, I finally got to update all my Hyper-V lab VMs to the new version of Hyper-V. This included updating the **Virtual Machine Configuration** version and enabling virtual network adapter **Device Naming** \- see [What's new in Hyper-V in Technical Preview](https://technet.microsoft.com/en-nz/library/dn765471.aspx) for more information.

But having a number of VM's running on this Hyper-V host I couldn't be bothered updating them all by hand. So as usual, PowerShell to the rescue.

First up, to upgrade the configuration of all the VMs on this host so the new features can be used I ran the following command:

```powershell
Get-VM | Update-VMVersion
```

Once that was completed (it took about 10 seconds) I could enable the **Device Naming** feature of all the Virtual Network Adapters on all *Generation 2* VMs (this feature isn’t supported on *Generation 1* VMs). The feature labels the NIC inside the guest OS (when supported) with the name you assign in the host.

To enable **Device Naming** on all *Generation 2* virtual NICs:

```powershell
Get-VM |
    Where-Object  -Property VirtualMachineSubType -eq 'Generation2' |
    Get-VMNetworkAdapter |
    Set-VMNetworkAdapter -DeviceNaming On
```

All in all this was much easier than the endless clicking I would have had to do in the UI. You can even combine the two steps into a single command:

```powershell
Get-VM |
    Update-VMVersion -Passthru |
    Where-Object -Property VirtualMachineSubType -eq 'Generation2' |
    Get-VMNetworkAdapter |
    Set-VMNetworkAdapter -DeviceNaming On
```

So now it’s off to try some of the other new Hyper-V features.
