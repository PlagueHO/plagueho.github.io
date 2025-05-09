---
title: "Windows Management Framework 5.0 (WMF) RTM re-published"
date: "2016-02-25"
tags: 
  - "powershell"
  - "wmf5-0"
---

After a bit of a false start the WMF 5.0 installer package has been [republished](https://blogs.msdn.microsoft.com/powershell/2016/02/24/windows-management-framework-wmf-5-0-rtm-packages-has-been-republished/). This released fixes the [PSModulePath issue](https://windowsserver.uservoice.com/forums/301869-powershell/suggestions/11148471-bug-wmf5-rtm-psmodulepath) that popped up on the first release of this package.

The changes to this package are:

> ### Changes in the republished packages
> 
> - The KB numbers of these packages (KB3134758, KB3134759, and KB3134760) are different than previously released WMF 5.0 RTM packages (KB3094174, KB3094175, and KB3094176).
> - These packages have fixes only for the PSModulePath issue compared to the previously released WMF 5.0 RTM packages.

 

**Note: if you're install the previous (broken) WMF 5.0 RTM package you'll have to uninstall it before installing this new one.**

> ### Uninstall previously released WMF 5.0 RTM packages
> 
> You must uninstall previously released WMF 5.0 RTM (KB3094174, KB3094175, and KB3094176) packages.

