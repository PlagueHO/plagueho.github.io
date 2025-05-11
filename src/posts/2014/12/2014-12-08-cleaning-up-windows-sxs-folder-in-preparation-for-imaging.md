---
title: "Cleaning Up Windows SxS Folder in Preparation for Imaging"
date: 2014-12-08
description: "Cleaning up the Windows SxS folder in preparation for imaging a Windows Server Core installation."
tags:
  - "windows-server-core"
  - "dism"
  - "features-on-demand"
  - "windows-server-2012"
isArchived: true
---

In preparation for releasing an operating system image to be used as a VM template, I usually like to perform some "shrinking commands" to make sure the image has as small a footprint as possible.

All the "shrinking commands" are command-line or PowerShell-based because they must also be able to be performed on a Windows Server Core installation.

## Remove all Uninstalled Feature Binaries

The first thing I usually do is remove any uninstalled feature binaries (as part of Windows Features on Demand). I've covered this in an earlier article [here](/blog/remove-all-uninstalled-feature-binaries/ "Remove all Uninstalled Feature Binaries").

## Remove Old Service Pack Backup Files

The following command removes any files that were backed up as part of installing a service pack. If you execute this command, you won't be able to uninstall any service packs.

```powershell
DISM /online /cleanup-image /SPSuperseded
```

![DISM /online /cleanup-image /SPSuperseded](/assets/images/screenshots/ss_dism_spsuperseded.png)
DISM /online /cleanup-image /SPSuperseded

## Remove Superseded Components

This command removes any components in the Windows SxS folder that have been superseded by newer versions.

For **Windows Server 2008/2008 R2/2012** and **Windows 7/8**:

```powershell
DISM /online /cleanup-image /StartComponentCleanup
```

For **Windows Server 2012 R2** and **Windows 8.1** (performs some additional optimization):

```powershell
DISM /online /cleanup-image /StartComponentCleanup /ResetBase
```

![DISM /online /cleanup-image /StartComponentCleanup /ResetBase](/assets/images/screenshots/ss_dism_startcomponentcleanup_resetbase.png)

```powershell
DISM /online /cleanup-image /StartComponentCleanup /ResetBase
```
