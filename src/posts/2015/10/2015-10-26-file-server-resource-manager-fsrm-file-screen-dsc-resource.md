---
title: "File Server Resource Manager (FSRM) File Screen DSC Resource"
date: 2015-10-26
description: "A quick article about the new cFSRMFileScreen DSC resource for configuring File Screens, File Screen Templates and File Screen Exceptions."
tags: 
  - "desired-state-configuration"
  - "file-server-resource-manager"
  - "dsc"
  - "file-screen"
  - "fsrm"
---

## Introduction

Continuing on with implementing File Server Resource Manager (FSRM) DSC Modules, I've added a new module for configuring **File Screens**, **File Screen Templates** and **File Screen Exceptions**. If you missed it the previous module for configuring quotas can be found [here.](https://dscottraynsford.wordpress.com/2015/10/23/file-server-resource-manager-fsrm-quotas-dsc-resource/)

## Resources

This module contains the following resources:

**cFSRMFileScreen** - configures FSRM File Screen. **cFSRMFileScreenAction** - configures FSRM File Screen Actions for File Screens. **cFSRMFileScreenTemplate** - configures FSRM File Screen Templates. **cFSRMFileScreenTemplateAction** - configures FSRM File Screen Template Actions for File Screen Templates. **cFSRMFileScreenExclusion** \- configures FSRM File Screen Exclusions.

The purpose of the resources should be fairly self explanatory, as long as you have a basic understanding of how FSRM File Screens are used.

## Installing the Resource

If you have installed **WMF 5.0** you can just download this directly from the [PowerShell Gallery](https://www.powershellgallery.com/) by running this command:

```powershell
Install-Module -Name cFSRMFileScreens
```

Otherwise you'll need to download this from the Microsoft Script Center [here](https://gallery.technet.microsoft.com/scriptcenter/cFSRMFileScreens-DSC-402a7f85) and unzip it into your **PowerShell modules path**.

## Using the Resource

As per the last post on these resources, rather than go into detail on using this resource, I thought I'd try and keep it short and just provide a [link to the documentation](https://github.com/PlagueHO/cFSRMFileScreens). This covers the parameters available in the resources as well as some usage examples.

If you need some additional guidance or other specific examples, please feel free to let me know and I'll do my best to help you out.

Hopefully this resource finds some use out there, but either way it has been extremely helpful to me really imprint the underlying FSRM features and usage into my own mind.

## Feedback

If you're interested in contributing to this resource, providing feedback or raising issues or requesting features, please feel free (anything is appreciated). You'll find the resource GitHub repository [here](https://github.com/PlagueHO/cFSRMFileScreens) where you can fork, issue pull requests and raise issues/feature requests.
