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

\[sourcecode language="powershell"\] Get-VM  | Update-VMVersion \[/sourcecode\]

Once that was completed (which took about 10 seconds) I could then enable the **Device Naming** feature of all the Virtual Network Adapters on all _Generation 2_ VM's(this feature isn't supported on _Generation 1_ VM's). The **Device Naming** feature will label the Network Adapter in the guest OS (for supported operating systems) with the name of the Virtual Network Adapter set in the host.

To enable **Device Naming** on all _Generation 2_ Network Adapters on all VM's on the host:

\[sourcecode language="powershell"\] Get-VM | Where-Object -Property VirtualMachineSubType -eq 'Generation2' | Get-VMNetworkAdapter | Set-VMNetworkAdapter -DeviceNaming On \[/sourcecode\]

All in all this was much easier than the eternal clicking I would have to have used in the UI. I could have even combined the two steps into one command:

\[sourcecode language="powershell"\] Get-VM | Update-VMVersion -Passthru | Where-Object -Property VirtualMachineSubType -eq 'Generation2' |  Get-VMNetworkAdapter | Set-VMNetworkAdapte r -DeviceNaming On \[/sourcecode\]

 So now it's off to try some of the other new Hyper-V features.

