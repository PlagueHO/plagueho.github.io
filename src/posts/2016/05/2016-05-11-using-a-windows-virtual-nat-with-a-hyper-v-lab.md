---
title: "Using a Windows Virtual NAT with a Hyper-V Lab"
date: 2016-05-11
description: "Using a Windows Virtual NAT with a Hyper-V Lab"
tags:
  - "hyper-v"
  - "windows-server-2016"
  - "nat"
isArchived: true
---

One of the new features introduced into Windows in build 10586 and above was the new **NAT** **Virtual Switch**. This feature was primarily introduced to ease the introduction of the [Windows Containers](https://msdn.microsoft.com/en-us/virtualization/windowscontainers/about/about_overview) in the upcoming release of **Windows Server 2016**.

In more recent builds of Windows (build 14295 and above) the **NAT Virtual Switch** has been removed in favor of a new **Virtual NAT** **Device** that exists separate from the **Hyper-V Virtual Switch**.

This new **Virtual NAT Device** is more inline with Microsoft's **Software Defined Networking** approach. It also allows us to create multiple Hyper-V Lab environments where each Lab is completely isolated from any others but still be connected to the Internet by way of the **Virtual NAT Device**.

Previously, to give all the machines in a Lab internet access we would have had to use:

- **An External Switch** - Connect all machines to an **External Virtual Switch** that was connected to the internet via one of the **Hyper-V Host's** network adapters.
- **A Guest NAT** - Install a NAT onto one of the Guest Virtual Machines in the Lab. For example, install Windows Server 2012 R2 with the Remote Access role and configure a NAT. This would still require at least this node in the Lab to be connected to the internet via an **External Virtual Switch**.

Each of these approaches had some drawbacks:

1. Each Lab was not completely isolated from the other labs.
1. An entire guest might need to be provisioned to provide internet access to the other machines in the Lab.

But using the **Virtual NAT device** allows us to configure Labs with complete network isolation but still being connected to the internet without the use of a **guest NAT**.

[![ss_virtualnat_diagram](/assets/images/screenshots/ss_virtualnat_diagram3.png)](/assets/images/screenshots/ss_virtualnat_diagram3.png)

So, to configure a pair of Labs like in the diagram above all we need is to execute a few **PowerShell Cmdlets**.

_Note: Make sure your Hyper-V host is at least **build 14295** (Windows 10 build 14295 or Windows Server 2016 TP5). Otherwise these cmdlets will fail._

If you want some more detail on setting up a Virtual NAT, see [Set up a NAT Network](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/user_guide/setup_nat_network).

## Configure Hyper-V Lab with NAT

To configure a Hyper-V Lab with NAT, perform the following steps, executing any PowerShell cmdlets in an **Administrator PowerShell console**.

1. Create a **Hyper-V Internal Virtual Switch** on your **Host**: \[sourcecode language="powershell"\] New-VMSwitch -Name Lab1 -SwitchType Internal \[/sourcecode\] This will also create a **Virtual Network Adapter** connected to the host.
1. Assign the gateway IP address of the NAT to the **Virtual Network Adapter**: \[sourcecode language="powershell"\] # Get the MAC Address of the VM Adapter bound to the virtual switch $MacAddress = (Get-VMNetworkAdapter -ManagementOS -SwitchName Lab1).MacAddress # Use the MAC Address of the Virtual Adapter to look up the Adapter in the Net Adapter list $Adapter = Get-NetAdapter | Where-Object { (($\_.MacAddress -replace '-','') -eq $MacAddress) } New-NetIPAddress –IPAddress 192.168.140.1 -PrefixLength 24 -InterfaceIndex $Adapter.ifIndex \[/sourcecode\]
1. Create the **Virtual NAT device**: \[sourcecode language="powershell"\] New-NetNat –Name Lab1NAT –InternalIPInterfaceAddressPrefix 192.168.140.0/24 \[/sourcecode\]
1. Configure the network settings on each **guest virtual network adapter** assigned to the **virtual switch** in the _192.168.140.0/24_ **subnet** and configure the **default gateway** to be _192.168.140.1_.

That's it - all machines in the Lab should have access to the internet and be completely isolated as well. Naturally I have updated the [LabBuilder](https://github.com/PlagueHO/LabBuilder) system to support this new functionality as well.

I hope this was useful and happy NATing.
