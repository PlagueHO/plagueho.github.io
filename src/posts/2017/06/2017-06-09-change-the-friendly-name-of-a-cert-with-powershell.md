---
title: "Change the Friendly Name of a Cert with PowerShell"
date: 2017-06-09
description: "Change the Friendly Name of a Cert with PowerShell"
tags:
  - "powershell"
  - "certificate-services"
---

While working on adding a new feature in the certificate request DSC resource, I came across this handy little trick: You can change the Friendly Name of a certificate using PowerShell.

All you need to do is identify the certificate using Get-ChildItem and then assign the new FriendlyName to it.

```powershell
(Get-ChildItem -Path Cert:\LocalMachine\My\97CB2928C7AC163A750BF16CF1D2CF1A3DDAAA8E).FriendlyName = 'New Cert Name'
```

![ss_cert_changefriendlyname](/assets/images/screenshots/ss_cert_changefriendlyname.png)

![ss_cert_changefriendlynamecertlm](/assets/images/screenshots/ss_cert_changefriendlynamecertlm.png)

Sometimes PowerShell still surprises me at how easy it can make things. I didn't need to search help or the internet - just typed it in and it worked!
