---
title: "Get the IP Address of a VM Attached to an External Switch"
date: "2015-09-07"
tags: 
  - "powershell"
---

My LabBuilder project is coming along nicely and it is building a large lab environment in Hyper-V within a few minutes. However, a problem I ran into was that sometimes the host couldn't connect (using _New-PSSession_ or equivalent) to a Guest VM to _copy files_ or _invoke commands_. This was because I was usually using the computer name to connect to the Guest VM - which won't always work. Instead using the **IP address** of the VM's Virtual NIC that is attached to the **External Switch**.

So what I needed was a command that could I fire on the **host** that would tell me the **IPv4** address of the external facing **NIC** on a VM. So this is what I came up with:

\[sourcecode language="powershell"\] $IPAddress = (Get-VMNetworkAdapter -VMName 'Server01').Where({$\_.SwitchName -eq (Get-VMSwitch -SwitchType External).Name}).IPAddresses.Where({$\_.Contains('.')}) \[/sourcecode\]

**Note**: this wouldn't be required at all, and I wouldn't need to have the Guest VM connected to the Host via an External switch if **PowerShell Direct** was integrated into the **New-PSSession** cmdlet. But unfortunately it isn't yet. But if you'd like to see this happen too, please go and vote for this [PowerShell Connect feedback item](https://connect.microsoft.com/PowerShell/Feedback/Details/1761123). If you heard of **PowerShell Direct**, see [this](http://blogs.technet.com/b/virtualization/archive/2015/05/14/powershell-direct-running-powershell-inside-a-virtual-machine-from-the-hyper-v-host.aspx) post.