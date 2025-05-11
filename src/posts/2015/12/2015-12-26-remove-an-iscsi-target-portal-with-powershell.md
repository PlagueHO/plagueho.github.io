---
title: "Remove an iSCSI Target Portal with PowerShell"
date: 2015-12-26
description: "A quick article about removing an iSCSI Target Portal using PowerShell."
tags:
  - "dsc"
  - "iscsi"
  - "powershell"
---

I ran into a small problem with removing **iSCSI Target Portals** using **PowerShell** the other day and thought it might be worth documenting.

Pretend you have an **iSCSI Target Portal** configured with a **Target Portal Address** of 192.168.129.24:

![ss_iscsi_gettargetportal](/assets/images/screenshots/ss_iscsi_gettargetportal.png)

You might therefore expect that you could remove this **Target Portal** with the command:

```powershell
Remove-IscsiTargetPortal -TargetPortalAddress 192.168.129.24
```

Unfortunately this won't work:

![ss_iscsi_removetargetportal1](/assets/images/screenshots/ss_iscsi_removetargetportal1.png)

And neither does this:

![ss_iscsi_removetargetportal2](/assets/images/screenshots/ss_iscsi_removetargetportal2.png)

What you actually have to do is specify both the **Target Portal Address** and the **Initiator Portal Address** when deleting an **iSCSI** **Target Portal**:

```powershell
Remove-IscsiTargetPortal -TargetPortalAddress 192.168.129.24 -InitiatorPortalAddress 192.168.129.30
```

![ss_iscsi_removetargetportalcorrect](/assets/images/screenshots/ss_iscsi_removetargetportalcorrect.png)

Over and out.
