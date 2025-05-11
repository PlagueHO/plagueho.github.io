---
title: "The Demise of SMB1 in the Windows Stack"
date: 2015-09-01
description: "A quick article about the demise of SMB1 in the Windows stack."
tags:
  - "smb"
  - "powershell"
isArchived: true
---

If you're interested in **SMB** and the general progress of the protocol, I'd recommend this 30-minute video on Channel 9: [The Demise of SMB1 in the Windows Stack](https://channel9.msdn.com/Blogs/Regular-IT-Guy/The-Demise-of-SMB-1-in-the-Windows-Stack?wt.mc_id=player). It motivated me to rid all my desktops and servers of SMB 1.0, the _ancient_ and _insecure_ protocol support.

To disable SMB 1.0 on a **Windows Server**:

```powershell
Set-SmbServerConfiguration -EnableSMB1Protocol $false
```

You can uninstall SMB 1.0 on a **Windows desktop**:

```powershell
Disable-WindowsOptionalFeature -FeatureName SMB1Protocol -Online
```

**Warning:** Don't do this if you have any older devices or operating systems that can only use SMB 1.0.
