---
title: "File Server Resource Manager (FSRM) Classifications DSC Resource"
date: "2015-11-04"
categories: 
  - "desired-state-configuration"
  - "file-server-resource-manager"
tags: 
  - "classifications"
  - "dsc"
  - "fsrm"
---

### Introduction

I've been spending a bit of time lately working on some issues and improvements on the [xNetworking](https://github.com/PowerShell/xNetworking) DSC Resource so haven't been spending as much time working on the series of File Server Resource Manager (FSRM) DSC Modules as I'd like. That said, I have managed to complete another module. This one is used for configuring **Classification Properties and Property Values**, **Classification Configuration** and **Classification Rules**.

If you missed any of the previous FSRM DSC Modules:

- [File Server Resource Manager (FSRM) File Screen DSC Resource](https://dscottraynsford.wordpress.com/2015/10/26/file-server-resource-manager-fsrm-file-screen-dsc-resource/)
- [File Server Resource Manager (FSRM) Quotas DSC Resource](https://dscottraynsford.wordpress.com/2015/10/23/file-server-resource-manager-fsrm-quotas-dsc-resource/)

### Resources

This module contains the following resources:

**cFSRMClassification-** configures FSRM Classification settings. **cFSRMClassificationProperty-** configures FSRM Classification Property Definitions. **cFSRMClassificationPropertyValue-** configures FSRM Classification Property Definition Values. This resource only needs to be used if the Description of a Classification Property Definition Value must be set. **cFSRMClassificationRule-** configures FSRM Classification Rules.

The purpose of the resources should be fairly self explanatory, as long as you have a basic understanding of how FSRM Classifications are used.

### Installing the Resource

If you have installed **WMF 5.0** you can just download this directly from the [PowerShell Gallery](https://www.powershellgallery.com/) by running this command:

\[sourcecode language="powershell"\] Install-Module -Name cFSRMClassifications \[/sourcecode\]

Otherwise you'll need to download this from the Microsoft Script Center [here](https://gallery.technet.microsoft.com/scriptcenter/cFSRMClassifications-DSC-8ed89153) and unzip it into your **PowerShell modules path**.

### Using the Resource

As per the last post on these resources, rather than go into detail on using this resource, I thought I'd try and keep it short and just provide a [link to the documentation](https://github.com/PlagueHO/cFSRMClassifications). This covers the parameters available in the resources as well as some usage examples.

If you need some additional guidance or other specific examples, please feel free to let me know and I'll do my best to help you out.

Hopefully this resource finds some use out there, but either way it has been extremely helpful to me really imprint the underlying FSRM features and usage into my own mind.

### Feedback

If you're interested in contributing to this resource, providing feedback or raising issues or requesting features, please feel free (anything is appreciated). You'll find the resource GitHub repository [here](https://github.com/PlagueHO/cFSRMClassifications) where you can fork, issue pull requests and raise issues/feature requests.
