---
title: "Reporting on File, Folder and Share Permissions and how they Change"
date: "2015-05-13"
categories: 
  - "acl-report-tools"
tags: 
  - "access-control-list"
  - "ntfs-security"
---

## Introduction

Late last year I was asked by a friend if I could write a program that could look at the ACL's defined within a folder structure and report back how they differed from some previously recorded state. This was basically so the administrators could report back what ACL's had change and verify that the "security Elves' hadn't been messing about.

So after several almost complete re-writes, the end result is the **ACLReportTools** PowerShell module.

## Overview

The intended purpose of this module is to allow an administrator to report on how ACL's for a set of path or shares have changed since a baseline was last created.

Basically it allows administrators to easily see what ACL changes are being made so they keep an eye on any security issues arising. If performing SMB share comparisons, the report generation can be performed remotely (from a desktop PC for example) and can also be run against shares on multiple computers.

The process that is normally followed using this module is:

1. Produce a _baseline_ **ACL Report** from a set of Folders or Shares (even on multiple computers).
2. Export the _baseline_ **ACL Report** as a file.
3.   ... Sometime later ...
4. Import the _baseline_ **ACL Report** from a stored file.
5. Produce an **ACL Difference** report comparing the imported _baseline_ **ACL Report** with the _current_ **ACL state** of the Folders or Shares
6. Optionally, export the **ACL Difference** report as _HTML_.
7. Repeat from step 1.

The comparison is always performed recursively scanning a specified set of folders or SMB shares. All files and folders within these locations will be scanned, but only non-inherited ACL's will be added to the ACL Reports.

## Report Details

An **ACL Report** is a list of non-inherited ACLs for a set of _Shares_ or _Folders_. It is stored as a _serialized_ array of _\[ACLReportTools.Permission\]_ objects. **ACL Reports** are returned by the _New-ACLShareReport_, _New-ACLPathFileReport_ and _Import-ACLReport_ cmdlets.

An **ACL Difference Report** is a list of all ACL differences between two ACL reports. It is stored as _serialized_ array of _\[ACLReportTools.PermissionDiff\]_ objects that are returned by the _Compare-ACLReports_ and _Import-ACLDiffReport_ cmdlet.

**ACL Reports** produced for _shares_ rather than _folders_ differ in that the _share name_ is provided in each _\[ACLReportTools.Permission\]_ object and that the _SMB Share ACL_ is also provided in the _\[ACLReportTools.Permission\]_ array.

## Important Notes

When performing a _comparison_, make sure the baseline report used covers the _same set_ of folders/shares you want to compare now. For example, don't try to compare ACL's for c:\\windows and c:\\wwwroot - that would make no sense and result in non-sensical output.

If shares or folders that are being compared have large numbers of non-inherited ACL's (perhaps because some junior admin doesn't understand inheritance) then a _comparison_ can take a **long** time (hours) and really hog your CPU. If this is the case, run the comparison from another machine using _share mode_ or run it after hours - or better yet, teach junior admins about inheritance! :)

You should also ensure that the account that is being used to generate any reports has read access to all paths and all content (including _recursive content_) that will be reported on and can also read the ACL's. If it can't access them then you may get access denied warnings (although the process will continue).

### NTFS Security Module

This Module uses the awesome [NTFS Security Module](https://gallery.technet.microsoft.com/scriptcenter/1abd77a5-9c0b-4a2b-acef-90dbb2b84e85 "Download the NTFS Security PS Module") to be installed in your PowerShell Modules path.

Ensure that you **unblock** all files in the _NTFS Security Module_ folder before attempting to Import Module _ACLReportTools_. The ACLReportTools module automatically looks for and Imports the _NTFS Security Module_ if present. If it is missing, an error will be returned stating that the module is missing. If you receive any other errors importing ACL Report tools, it is usually because some of the _NTFS Security Module_ files are **blocked** and need to be **unblocked** manually or with Unblock-File. You can confirm this by calling _Import-Module NTFSSecurity_ - if any errors appear then it is most likely the caused by **blocked** files. After **unblocking** the module files you may need to restart PowerShell.

## Installing ACLReportTools

1. Unzip the archive containing the **ACLReportTools** module into the one of the _PowerShell Modules_ folders (E.g. $Home\\documents\\windowspowershell\\modules).
2. This will create a folder called **ACLReportTools** containing all the files required for this module.
3. In PowerShell execute:

```powershell
Import-Module ACLReportTools
```

## How to Use It

The basic steps for using this module is as follows:

1. Create a **Baseline ACL Report** file on a set of Folders.
2. Compare the **Baseline ACL Report** file with the _current ACL's_ for the same set of Folders.
3. Optionally, convert the **ACL Comparisson Report** into an HTML report file.

In the for following examples, the **e:\\work** and **d:\\profiles** are being used to produce an _ACL Difference_ report for. The _Baseline ACL Report_ and the _ACL Difference Report_ will be saved into the current users **documents** folder.

### Step 1: Create a Baseline ACL Report file on a set of Folders

The first step is to create _Baseline ACL Report_ on the folders **e:\\work** and **d:\\profiles** and store it in the b_aseline.acl_ file in the current users **documents** folder:

```powershell
Import-Module ACLReportTools
New-ACLPathFileReport -Path "e:\Work","d:\Profiles" |
    Export-ACLReport -Path "$HOME\Documents\Baseline.acl" -Force
```

### Step 2: Compare the Baseline ACL Report file with the current ACLs for the same set of Folders

This step is usually performed a few days or weeks after step 1. In this step the _Baseline ACL Report_ created in step 1 is compared with the _current ACL's_ for the same set of folders used in step 1. The output is put into the variable **$DiffReport** which can then be exported as a file using the **Export-ACLDiffReport** cmdlet or saved as HTML using **Export-ACLPermissionDiffHTML** for easier review.

```powershell
Import-Module ACLReportTools
$DiffReport = Compare-ACLReports `
    -Baseline (Import-ACLReport -Path "$HOME\Documents\Baseline.acl") `
    -Path "e:\Work","d:\Profiles"
```

### Step 3: Convert the ACL Comparison Report into an HTML Report File

Once the _ACL Difference Report_ has been produced, it could be simply dumped straight into the pipeline or converted into an HTML using the **Export-ACLPermissionDiffHTML** cmdlet. The title that will appear on the HTML page is also provided.

```powershell
$DiffReport | Export-ACLPermissionDiffHtml `
    -Title 'ACL Diff Report for e:\work and d:\profile'
```

### Reporting on Shares Instead of Folders

Instead of specifying a set of folders it is also possible to specify a list of computers and/or SMB shares to pull the _ACL Reports_ from. For example if we wanted to report on the shares **Share1** and **Share2** on computer **Client** the following commands could be used for step 1:

```powershell
# Baseline for Share1 and Share2 on CLIENT
Import-Module ACLReportTools
Compare-ACLReports `
    -Baseline (Import-ACLReport -Path "$HOME\Documents\Baseline.acl") `
    -ComputerName Client `
    -Include Share1,Share2
```

Then for step 2 we would use:

```powershell
# Later, create the difference report
Import-Module ACLReportTools
$DiffReport = Compare-ACLReports `
    -Baseline (Import-ACLReport -Path "$HOME\Documents\Baseline.acl") `
    -ComputerName Client `
    -Include Share1,Share2
```

Step 3 in would be exactly the same as in the Folder scenario.

## Final Word

What started as a simple script actually ended up turning into quite a large module that taught me a huge amount about PowerShell. So I hope someone else out there is also able to find a use for this and it helps track down some of those 'Permission Elves'.

