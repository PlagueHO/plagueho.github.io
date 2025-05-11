---
title: "WMF 5.0 Download Removed from Download Center"
date: 2015-12-24
description: "Microsoft has removed the WMF 5.0 RTM download from the download center because of a significant bug."
tags: 
  - "powershell"
isArchived: true
---

Bit of a bump in the WMF 5.0 road today: Microsoft has removed the WMF 5.0 RTM download from the download center because of a significant bug:

_We recently released Windows Management Framework (WMF) 5.0 RTM delivering many requested improvements and fixes, via the Microsoft Download Center as announced in a [previous blog post](http://blogs.msdn.com/b/powershell/archive/2015/12/16/windows-management-framework-wmf-5-0-rtm-is-now-available.aspx). However, we have discovered a [bug](https://windowsserver.uservoice.com/forums/301869-powershell/suggestions/11148471-bug-wmf5-rtm-psmodulepath) which resets the PowerShell module environment during installation. As this issue can have a serious impact on our customers, we are taking the action to stop delivery of WMF 5.0 RTM, and have removed the packages from the Download Center. Additionally, we will be unpublishing Azure DSC Extension Handler versions 2.11 and 2.12 as they automatically install WMF 5.0 RTM._

So if you're planning on rolling WMF5.0 out to production, best hold off for the moment. See the original blog post [here](http://blogs.msdn.com/b/powershell/archive/2015/12/23/windows-management-framework-wmf-5-0-currently-removed-from-download-center.aspx).
