---
title: "WSUS - Declining all Superceded Updates - NOW!"
date: 2015-05-13
description: "A quick PowerShell script to decline all superceded updates in WSUS."
tags:
  - "windows-server-update-services"
  - "wsus"
  - "powershell"
---

Just a quick snippet today. I wrote this because I was didn't want to have to wait for **30** days before unusused superceded updates in my **WSUS** server were automatically _declined_ - especially those daily "Definition Update for Windows Defender".

[![ss_wsus_definitionupdates](/assets/images/blog/ss_wsus_definitionupdates.png)](/assets/images/blog/ss_wsus_definitionupdates.png)

If you're happy waiting for these _unused superceded updates_ to be _declined_ after **30** days then you can just use the following cmdlet:

```powershell
Invoke-WsusServerCleanup -DeclineSupersededUpdates
```

However, if you don't want to wait you can fire off this little PowerShell script. It is just a single line of PowerShell code that will automatically _decline_ all updates with a status of anything except for declined and has at least one _superceding_ update:

```powershell
Get-WSUSUpdate -Classification All -Status Any -Approval AnyExceptDeclined |
    Where-Object {
        $_.Update.GetRelatedUpdates(
            [Microsoft.UpdateServices.Administration.UpdateRelationship]::UpdatesThatSupersedeThisUpdate
        ).Count -gt 0
    } |
    Deny-WsusUpdate
```

The command will take a few minutes to run (depending on how many updates your WSUS Server has) - on my WSUS server it took about 5 minutes. Once the process has completed you could then trigger the cmdlet to perform a _WSUS Server cleanup_ (to get rid of any obsolete content files):

```powershell
Invoke-WsusServerCleanup -CleanupObsoleteUpdates -CleanupUnneededContentFiles
```

That is about it for today!
