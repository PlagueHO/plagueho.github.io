---
title: "cDFS moving to the PowerShell Team"
date: "2016-05-06"
categories: 
  - "desired-state-configuration"
  - "distributed-file-system"
  - "dsc"
tags: 
  - "powershell"
---

Just a Friday afternoon heads up - if you're using the [cDFS DSC Resource](https://www.powershellgallery.com/packages/cDFS/2.1.0.238) I created to manage Windows Server Distributed File System (Replication and Namespaces), it has now been accepted into the PowerShell Community resources and will be under the control of the PowerShell Team.

This means that the [GitHub source code repository](https://github.com/PlagueHO/xDFS) will be moving over to the [PowerShell organization](https://github.com/PowerShell) in the next few days. This also means that any future releases of this resource module won't be provided by me as **cDFS**, but will be released by the PowerShell team as **xDFS**.

So I recommend that when this happens you switch over to using the **xDFS** resource. I will put another post up here when the change over officially occurs. The first official release version under the new **xDFS** name will be **3.0.0.x**. I won't make any further changes or bug fixes to the **cDFS** resources.

It is also worth noting that as part of this move some minor changes were made to the DSC Resource modules. These are **breaking changes** and you will most likely need to update any DSC Configurations depending on this, but you would have to do this anyway because of the name change.

The changes are:

- Resource **xDFSRepGroup** renamed to **xDFSReplicationGroup**
- Resource **xDFSRepGroupConnection** renamed to **xDFSReplicationGroupConnection**
- Resource **xDFSRepGroupFolder** renamed to **xDFSReplicationGroupFolder**
- Resource **xDFSRepGroupMembership** renamed to **xDFSReplicationGroupMembership**
- **xDFSReplicationGroupConnection:**
    - Changed **DisableConnection** parameter to **EnsureEnabled**.
    - Changed **DisableRDC** parameter to **EnsureRDCEnabled**.

These changes should only require minor changes to your configuration scripts to implement.

Thanks for reading and have a great Friday~
