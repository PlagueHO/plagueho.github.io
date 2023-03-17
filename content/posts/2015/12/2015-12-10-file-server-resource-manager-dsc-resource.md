---
title: "File Server Resource Manager DSC Resource"
date: "2015-12-10"
categories: 
  - "desired-state-configuration"
  - "dsc"
  - "file-server-resource-manager"
tags: 
  - "powershell"
---

### With Our Powers Combined we are captain FSRM

I've been recently working on combining my three **File Server Resource Manager DSC Resources** into a single module. This made more sense and will make it a lot easier to maintain.

### Integration Testing

At the same time as combining these resource, I also added **integration** **tests** (based on the ones that were added recently to the [Microsoft xNetworking](https://github.com/PowerShell/xNetworking/blob/dev/Tests/Integration/MSFT_xFirewall.Integration.Tests.ps1) resource). This identified a number of bugs that had previously been overlooked. If you're in the DSC resource writing game (or just starting), I strongly recommend adding **integration tests** early on - it'll definitely save you a lot of grief and just make life more enjoyable for you and everyone who uses your resource. I intend on writing an introduction article to **unit** **and integration testing DSC resources** over the next month - so keep an eye out for it if you're interested.

The new **File Server Resource Manager (cFSRM)** resource replaces these old resources which have now been deprecated:

- [cFSRMQuotas DSC Resource -configure FSRM Quotas, Quota Templates and Auto Quotas](https://gallery.technet.microsoft.com/scriptcenter/cFSRMFileScreens-DSC-402a7f85)
- [cFSRMFileScreens DSC Resource -configure FSRM File Screens & Templates](https://gallery.technet.microsoft.com/scriptcenter/cFSRMFileScreens-DSC-402a7f85)
- [cFSRMClassifications DSC Resource -configure FSRM File Classifications](https://gallery.technet.microsoft.com/scriptcenter/cFSRMClassifications-DSC-8ed89153)

So, if you're using any of the above resources, you should update your **DSC Configuration** files to use the new **cFSRM** one. The resources are completely compatible with the old ones so you should just need to update the **Import-DSCModule** cmdlet in any configuration files.

### Installing the Resource

You can find the new **cFSRM** resource on [Microsoft Script Center](https://gallery.technet.microsoft.com/scriptcenter/cFSRM-DSC-Resource-58c7e57f) or on the [PowerShell Gallery](https://www.powershellgallery.com/packages/cFSRM/).

For those of you using **Windows Management Framework 5.0** (or have the **PowerShellGet** module installed) you can just use the command:

\[sourcecode language="powershell"\] Install-Module -Name cFSRM \[/sourcecode\]

### Using the Resource

Rather than go into detail on using this resource, you can find the full documentation and usage examples [here](https://github.com/PlagueHO/cFSRM).

If you need some additional guidance or other specific examples, please feel free to let me know and I'll do my best to help you out.

### Feedback

If you're interested in contributing to this resource, providing feedback or raising issues or requesting features, please feel free (anything is appreciated). You'll find the resource GitHub repository [here](https://github.com/PlagueHO/cFSRM) where you can fork, issue pull requests and raise issues/feature requests.
