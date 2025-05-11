---
title: "List Global Assembly Cache using PowerShell"
date: 2018-09-10
description: "List Global Assembly Cache using PowerShell"
tags:
  - "gac"
  - "global-assembly-cache"
  - "powershell"
---

The list of assemblies stored in the Global Assembly Cache (GAC) can be found in the registry under the **HKEY\_CLASSES\_ROOT\\Installer\\Assemblies\\Global** key.

If you want to get a list of the assemblies registered in the GAC using PowerShell you can use this snippet:

```powershell
New-PSDrive -Name HKCR -PSProvider 'Microsoft.PowerShell.Core\Registry' -Root HKEY_CLASSES_ROOT
Get-ItemProperty -Path 'HKCR:\Installer\Assemblies\Global' | Get-Member -MemberType NoteProperty
```

![ss_gac_getcontent](/assets/images/screenshots/ss_gac_getcontent.png)

The first line registers a new drive called **HKCR** in PowerShell that maps to the **HKEY\_CLASSES\_ROOT** in the registry. This is required because, by default only the **HKEY\_CURRENT\_USER** and **HKEY\_LOCAL\_MACHINE** registry hives are registered as drives in PowerShell.

The second line just gets the list of registry properties in the **HKEY\_CLASSES\_ROOT\\Installer\\Assemblies\\Global** key and displays them.
