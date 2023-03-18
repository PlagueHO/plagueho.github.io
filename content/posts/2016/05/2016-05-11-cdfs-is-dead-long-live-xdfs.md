---
title: "cDFS is dead, long live xDFS"
date: "2016-05-11"
categories:
  - "desired-state-configuration"
  - "distributed-file-system"
  - "dsc"
---

The [xDFS DSC resource module](https://github.com/PowerShell/xDFS) has been officially released to the [PowerShell Gallery](https://www.powershellgallery.com/packages/xdfs) thanks to the awesome review efforts of the Microsoft PowerShell Team. The **cDFS DSC Resource** has now been **unlisted** from the PowerShell Gallery. So now is the time to update any DSC configuration scripts to use xDFS.

![ss_xdfs_releasepsgallery](/images/ss_xdfs_releasepsgallery.png)

_**Important: There were some minor changes to xDFS when it was converted from cDFS. For information on what you'll need to change to convert to xDFS see my [earlier post](https://dscottraynsford.wordpress.com/2016/05/06/cdfs-moving-to-the-powershell-team/).**_

