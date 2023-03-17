---
title: "Cleaning Up Windows SxS Folder in Preparation for Imaging"
date: "2014-12-08"
categories: 
  - "dism"
  - "features-on-demand"
  - "windows-server-2012"
tags: 
  - "windows-server-core"
---

In preparation for releasing an operating system image to be used as a WM template I usually like to perform some "shrinking commands" to make sure the image has as small a foot-print as possible.

All the "shrinking commands" are all command line or PowerShell based because they must also be able to be performed on a Windows Server Core installation.

### Remove all Uninstalled Feature Binaries

The first thing I usually do is remove any uninstalled feature binaries (as part of Windows Features on Demand). I've covered this in an earlier article [here](https://dscottraynsford.wordpress.com/2014/12/05/remove-all-uninstalled-feature-binaries/ "Remove all Uninstalled Feature Binaries").

### Remove Old Service Pack Backup Files

The following command removes any files that were backed up as part of installing a service pack. If you execute this command you won't be able to uninstall any service packs.

DISM /online /cleanup-image /SPSuperseded

\[caption id="attachment\_60" align="alignnone" width="660"\][![DISM /online /cleanup-image /SPSuperseded](https://dscottraynsford.files.wordpress.com/2014/12/ss_dism_spsuperseded.png?w=660)](https://dscottraynsford.files.wordpress.com/2014/12/ss_dism_spsuperseded.png) DISM /online /cleanup-image /SPSuperseded\[/caption\]

### Remove Superceeded Components

This command removes any components in the Windows SxS folder that have been superceeded by newer versions.

Windows Server 2008/2008 R2/2012 and Windows 7/8:

DISM /online /cleanup-image /StartComponentCleanup

Windows Server 2012 R2 and Windows 8.1 (performs some additional optimization):

DISM /online /cleanup-image /StartComponentCleanup /ResetBase

\[caption id="attachment\_58" align="alignnone" width="660"\][![DISM /online /cleanup-image /StartComponentCleanup /ResetBase](https://dscottraynsford.files.wordpress.com/2014/12/ss_dism_startcomponentcleanup_resetbase.png?w=660)](https://dscottraynsford.files.wordpress.com/2014/12/ss_dism_startcomponentcleanup_resetbase.png) DISM /online /cleanup-image /StartComponentCleanup /ResetBase\[/caption\]
