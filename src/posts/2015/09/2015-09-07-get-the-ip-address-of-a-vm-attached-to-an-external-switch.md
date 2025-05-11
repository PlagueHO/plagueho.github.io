---
title: "Get the IP Address of a VM Attached to an External Switch"
date: 2015-09-07
description: "A quick PowerShell command to get the IP address of a VM attached to an external switch."
tags: 
  - "powershell"
isArchived: true
---

My LabBuilder project is coming along nicely and it is building a large lab environment in Hyper-V within a few minutes. However, a problem I ran into was that sometimes the host couldn't connect (using _New-PSSession_ or equivalent) to a Guest VM to _copy files_ or _invoke commands_. This was because I was usually using the computer name to connect to the Guest VM—which won't always work. Instead, I needed to use the **IP address** of the VM's Virtual NIC that is attached to the **External Switch**.

So what I needed was a command that I could fire on the **host** that would tell me the **IPv4** address of the external-facing **NIC** on a VM. So this is what I came up with:

```powershell
# filepath: d:\source\GitHub\PlagueHO\plagueho.github.io\content\blog\2015\09\2015-09-07-get-the-ip-address-of-a-vm-attached-to-an-external-switch.md
$IPAddress = (Get-VMNetworkAdapter -VMName 'Server01').Where({
    $_.SwitchName -eq (Get-VMSwitch -SwitchType External).Name
}).IPAddresses.Where({ $_.Contains('.') })
```

> [!NOTE]
> This wouldn't be required at all, and I wouldn't need to have the Guest VM connected to the Host via an External switch, if **PowerShell Direct** was integrated into the **New-PSSession** cmdlet. But unfortunately it isn't yet. If you'd like to see this happen too, please go and vote for this [PowerShell Connect feedback item](https://connect.microsoft.com/PowerShell/Feedback/Details/1761123). If you haven't heard of **PowerShell Direct**, see [this](http://blogs.technet.com/b/virtualization/archive/2015/05/14/powershell-direct-running-powershell-inside-a-virtual-machine-from-the-hyper-v-host.aspx) post.
